/*
 * This file is part of Dorado 7.x (http://dorado7.bsdn.org).
 * 
 * Copyright (c) 2002-2012 BSTEK Corp. All rights reserved.
 * 
 * This file is dual-licensed under the AGPLv3 (http://www.gnu.org/licenses/agpl-3.0.html) 
 * and BSDN commercial (http://www.bsdn.org/licenses) licenses.
 * 
 * If you are unsure which license is appropriate for your use, please contact the sales department
 * at http://www.bstek.com/contact.
 */

package com.bstek.dorado.view.service;

import java.io.Writer;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.codehaus.jackson.node.ArrayNode;
import org.codehaus.jackson.node.ObjectNode;
import org.codehaus.jackson.type.TypeReference;

import com.bstek.dorado.core.Configure;
import com.bstek.dorado.data.DataTypeResolver;
import com.bstek.dorado.data.JsonConvertContext;
import com.bstek.dorado.data.JsonUtils;
import com.bstek.dorado.data.ParameterWrapper;
import com.bstek.dorado.data.entity.EntityEnhancer;
import com.bstek.dorado.data.entity.EntityState;
import com.bstek.dorado.data.entity.EntityUtils;
import com.bstek.dorado.data.entity.EntityWrapper;
import com.bstek.dorado.data.resolver.DataItems;
import com.bstek.dorado.data.resolver.DataResolver;
import com.bstek.dorado.data.resolver.manager.DataResolverManager;
import com.bstek.dorado.data.variant.MetaData;
import com.bstek.dorado.view.manager.ViewConfig;
import com.bstek.dorado.view.output.JsonBuilder;
import com.bstek.dorado.view.output.OutputContext;
import com.bstek.dorado.view.output.Outputter;
import com.bstek.dorado.view.widget.action.RefreshMode;
import com.bstek.dorado.web.DoradoContext;

/**
 * 提供Ajax数据处理服务的处理器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apr 16, 2009
 */
public class ResolveDataServiceProcessor extends DataServiceProcessorSupport {
	private Outputter simplePropertyValueOnlyDataOutputter;
	private DataResolverManager dataResolverManager;

	public void setSimplePropertyValueOnlyDataOutputter(
			Outputter simplePropertyValueOnlyDataOutputter) {
		this.simplePropertyValueOnlyDataOutputter = simplePropertyValueOnlyDataOutputter;
	}

	public void setDataResolverManager(DataResolverManager dataResolverManager) {
		this.dataResolverManager = dataResolverManager;
	}

	protected DataResolver getDataResolver(String dataResolverName)
			throws Exception {
		DataResolver dataResolver;
		// 判断是否View中的私有DataResolver
		if (dataResolverName.startsWith(PRIVATE_VIEW_OBJECT_PREFIX)) {
			ParsedDataObjectName parsedName = new ParsedDataObjectName(
					dataResolverName);
			ViewConfig viewConfig = getViewConfig(DoradoContext.getCurrent(),
					parsedName.getViewName());
			dataResolver = viewConfig.getDataResolver(parsedName
					.getDataObject());
		} else {
			dataResolver = dataResolverManager
					.getDataResolver(dataResolverName);
		}
		return dataResolver;
	}

	@Override
	@SuppressWarnings("rawtypes")
	protected void doExecute(Writer writer, ObjectNode objectNode,
			DoradoContext context) throws Exception {
		Object parameter = jsonToJavaObject(objectNode.get("parameter"), null,
				null, false);
		MetaData sysParameter = (MetaData) jsonToJavaObject(
				objectNode.get("sysParameter"), null, null, false);

		if (sysParameter != null && !sysParameter.isEmpty()) {
			parameter = new ParameterWrapper(parameter, sysParameter);
		}

		String dataResolverName = JsonUtils.getString(objectNode,
				"dataResolver");
		DataResolver dataResolver = getDataResolver(dataResolverName);
		if (dataResolver == null) {
			throw new IllegalArgumentException("Unknown DataResolver ["
					+ dataResolverName + "].");
		}

		ArrayNode jsonDataItems = (ArrayNode) objectNode.get("dataItems");
		DataItems dataItems = null;
		Map<String, UpdateInfo> updateInfos = new HashMap<String, UpdateInfo>();

		long lastTimeStamp = Long.MAX_VALUE;
		Object result = null;

		EntityEnhancer.disableGetterInterception();
		try {
			dataItems = new DataItems();
			for (Iterator it = jsonDataItems.iterator(); it.hasNext();) {
				ObjectNode item = (ObjectNode) it.next();
				String alias = JsonUtils.getString(item, "alias");

				String refreshModeText = JsonUtils.getString(item,
						"refreshMode");
				RefreshMode refreshMode = (StringUtils.isEmpty(refreshModeText)) ? RefreshMode.value
						: RefreshMode.valueOf(refreshModeText);

				boolean autoResetEntityState = JsonUtils.getBoolean(item,
						"autoResetEntityState", true);

				JsonConvertContext jsonContext = new JsonConvertContextImpl(
						true, false, this);
				Object data = JsonUtils.toJavaObject(item.get("data"), null,
						null, true, jsonContext);

				dataItems.put(alias, data);
				updateInfos.put(alias, new UpdateInfo(refreshMode,
						autoResetEntityState, jsonContext));
			}

			lastTimeStamp = EntityEnhancer.getLastTimeStamp();
			result = dataResolver.resolve(dataItems, parameter);
		} finally {
			EntityEnhancer.enableGetterInterception();
		}

		OutputContext outputContext = new OutputContext(writer);
		outputContext.setUsePrettyJson(Configure
				.getBoolean("view.outputPrettyJson"));
		JsonBuilder jsonBuilder = outputContext.getJsonBuilder();
		jsonBuilder.object();

		outputContext.setShouldOutputEntityState(true);
		try {
			for (UpdateInfo updateInfo : updateInfos.values()) {
				if (!updateInfo.isAutoResetEntityState()) {
					continue;
				}
				Collection<Object> entities = updateInfo.getJsonContext()
						.getEntityCollection();
				if (entities != null) {
					EntityUtils.resetEntities(entities, true);
				}
			}

			jsonBuilder.key("entityStates");
			outputEntityStates(jsonBuilder, dataItems, updateInfos,
					outputContext, lastTimeStamp);
		} finally {
			outputContext.setShouldOutputEntityState(false);
		}

		boolean supportsEntity = JsonUtils.getBoolean(objectNode,
				"supportsEntity");
		if (supportsEntity) {
			List<String> loadedDataTypes = JsonUtils.get(objectNode,
					"loadedDataTypes", new TypeReference<List<String>>() {
					});
			outputContext.setLoadedDataTypes(loadedDataTypes);
		}

		outputContext.setShouldOutputDataTypes(supportsEntity);
		outputContext.setShouldOutputEntityState(false);

		jsonBuilder.key("returnValue");
		outputResult(result, outputContext);
		jsonBuilder.endObject();
	}

	protected void outputEntityStates(JsonBuilder json, DataItems dataItems,
			Map<String, UpdateInfo> updateInfos, OutputContext context,
			long lastTimeStamp) throws Exception {
		json.object();
		for (Map.Entry<String, Object> entry : dataItems.entrySet()) {
			String name = entry.getKey();
			Object item = entry.getValue();

			UpdateInfo updateInfo = updateInfos.get(name);
			RefreshMode refreshMode = updateInfo.getRefreshMode();
			if (RefreshMode.none.equals(refreshMode)) {
				continue;
			}
			if (RefreshMode.cascade.equals(refreshMode)) {
				if (item instanceof Collection<?>) {
					for (Object entity : ((Collection<?>) item)) {
						outputEntityDataAndState(json, entity, true, true,
								context, lastTimeStamp);
					}
				} else if (EntityUtils.isSimpleValue(item)) {
					continue;
				} else {
					outputEntityDataAndState(json, item, true, true, context,
							lastTimeStamp);
				}
			} else {
				boolean shouldOutputData = RefreshMode.value
						.equals(refreshMode);
				for (Object entity : updateInfo.getJsonContext()
						.getEntityCollection()) {
					outputEntityDataAndState(json, entity, shouldOutputData,
							false, context, lastTimeStamp);
				}
			}
		}
		json.endObject();
	}

	protected void outputEntityDataAndState(JsonBuilder json, Object entity,
			boolean shouldOutputData, boolean shouldOutputSubEntity,
			OutputContext context, long lastTimeStamp) throws Exception {
		EntityWrapper entityWrapper = EntityWrapper.create(entity);
		EntityState state = entityWrapper.getState();
		shouldOutputData = (shouldOutputData && state != EntityState.DELETED && (shouldOutputSubEntity || entityWrapper
				.getTimeStamp() > lastTimeStamp));
		if (!shouldOutputData) {
			if (state != EntityState.NONE) {
				json.key(String.valueOf(entityWrapper.getEntityId()));
				json.value(EntityState.toInt(state));
			}
		} else {
			json.key(String.valueOf(entityWrapper.getEntityId()));
			if (shouldOutputSubEntity) {
				outputData(entity, context);
			} else {
				simplePropertyValueOnlyDataOutputter.output(entity, context);
			}
		}
	}
}

class UpdateInfo {
	private RefreshMode refreshMode;
	private boolean autoResetEntityState;
	private JsonConvertContext jsonContext;

	public UpdateInfo(RefreshMode refreshMode, boolean autoResetEntityState,
			JsonConvertContext jsonContext) {
		this.refreshMode = refreshMode;
		this.autoResetEntityState = autoResetEntityState;
		this.jsonContext = jsonContext;
	}

	public RefreshMode getRefreshMode() {
		return refreshMode;
	}

	public boolean isAutoResetEntityState() {
		return autoResetEntityState;
	}

	public JsonConvertContext getJsonContext() {
		return jsonContext;
	}
}

class JsonConvertContextImpl implements JsonConvertContext {
	private Collection<Object> entityCollection;
	private Collection<Collection<?>> entityListCollection;
	private DataTypeResolver dataTypeResolver;

	public JsonConvertContextImpl(boolean collectEntities,
			boolean collectEntityLists, DataTypeResolver dataTypeResolver) {
		if (collectEntities) {
			entityCollection = new ArrayList<Object>();
		}
		if (collectEntityLists) {
			entityListCollection = new ArrayList<Collection<?>>();
		}
		this.dataTypeResolver = dataTypeResolver;
	}

	public Collection<Object> getEntityCollection() {
		return entityCollection;
	}

	public Collection<Collection<?>> getEntityListCollection() {
		return entityListCollection;
	}

	public DataTypeResolver getDataTypeResolver() {
		return dataTypeResolver;
	}

}
