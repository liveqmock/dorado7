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
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.node.ObjectNode;

import com.bstek.dorado.data.Constants;
import com.bstek.dorado.data.DataTypeResolver;
import com.bstek.dorado.data.JsonConvertContext;
import com.bstek.dorado.data.JsonUtils;
import com.bstek.dorado.data.config.DataTypeName;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.data.type.manager.DataTypeManager;
import com.bstek.dorado.util.StringAliasUtils;
import com.bstek.dorado.view.ViewState;
import com.bstek.dorado.view.config.xml.ViewXmlConstants;
import com.bstek.dorado.view.manager.ViewConfig;
import com.bstek.dorado.view.manager.ViewConfigManager;
import com.bstek.dorado.view.output.JsonBuilder;
import com.bstek.dorado.view.output.OutputContext;
import com.bstek.dorado.view.output.Outputter;
import com.bstek.dorado.web.DoradoContext;
import com.bstek.dorado.web.DoradoContextUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since May 13, 2009
 */
public abstract class DataServiceProcessorSupport implements ServiceProcessor,
		DataTypeResolver {

	public static class ParsedDataObjectName {
		private String viewName;
		private String dataObject;

		public ParsedDataObjectName(String name) {
			int i = name.indexOf(ViewXmlConstants.PATH_COMPONENT_PREFIX);
			String viewSectionAlias = name.substring(
					PRIVATE_VIEW_OBJECT_PREFIX.length(), i);
			dataObject = name.substring(i + 1);

			String viewSection = StringAliasUtils
					.getOriginalString(viewSectionAlias);
			if (viewSection == null) {
				throw new IllegalArgumentException("Invalid ViewAlias ["
						+ viewSectionAlias + "].");
			}
			viewName = viewSection;
		}

		public String getViewName() {
			return viewName;
		}

		public String getDataObject() {
			return dataObject;
		}
	}

	protected static final String VIEW_STATE_ATTRIBUTE_KEY = ViewState.class
			.getName();
	protected static final String PRIVATE_VIEW_OBJECT_PREFIX = ViewXmlConstants.PATH_VIEW_SHORT_NAME
			+ Constants.PRIVATE_DATA_OBJECT_SUBFIX;

	protected ViewConfigManager viewConfigManager;
	private DataTypeManager dataTypeManager;
	private Outputter dataOutputter;
	private Outputter includeDataTypesOutputter;

	public void setDataTypeManager(DataTypeManager dataTypeManager) {
		this.dataTypeManager = dataTypeManager;
	}

	public void setViewConfigManager(ViewConfigManager viewConfigManager) {
		this.viewConfigManager = viewConfigManager;
	}

	public Outputter getDataOutputter() {
		return dataOutputter;
	}

	public void setDataOutputter(Outputter dataOutputter) {
		this.dataOutputter = dataOutputter;
	}

	public void setIncludeDataTypesOutputter(Outputter includeDataTypesOutputter) {
		this.includeDataTypesOutputter = includeDataTypesOutputter;
	}

	public final void execute(Writer writer, ObjectNode objectNode,
			DoradoContext context) throws Exception {
		ViewState originViewState = (ViewState) context
				.getAttribute(VIEW_STATE_ATTRIBUTE_KEY);
		context.setAttribute(VIEW_STATE_ATTRIBUTE_KEY, ViewState.servicing);

		Map<String, Object> viewContext = new HashMap<String, Object>();
		JsonNode rudeContext = objectNode.get("context");
		if (rudeContext != null && !rudeContext.isNull()) {
			Iterator<Entry<String, JsonNode>> fields = rudeContext.getFields();
			while (fields.hasNext()) {
				Entry<String, JsonNode> entry = fields.next();
				String key = entry.getKey();
				JsonNode jsonValue = rudeContext.get(key);
				Object value = null;
				if (jsonValue != null) {
					value = JsonUtils.toJavaObject(jsonValue, null);
				}
				viewContext.put(key, value);
			}
		}
		DoradoContextUtils.pushNewViewContext(context, viewContext);

		try {
			doExecute(writer, objectNode, context);
		} finally {
			DoradoContextUtils.popViewContext(context);
			context.setAttribute(VIEW_STATE_ATTRIBUTE_KEY, originViewState);
		}
	}

	protected abstract void doExecute(Writer writer, ObjectNode objectNode,
			DoradoContext context) throws Exception;

	protected void outputResult(Object result, OutputContext context)
			throws Exception {
		DoradoContext doradoContext = DoradoContext.getCurrent();
		Map<String, Object> viewContext = DoradoContextUtils
				.getViewContext(doradoContext);

		if (context.isShouldOutputDataTypes() || viewContext != null) {
			JsonBuilder jsonBuilder = context.getJsonBuilder();

			jsonBuilder.object();
			jsonBuilder.key("data");
			outputData(result, context);

			if (context.isShouldOutputDataTypes()) {
				jsonBuilder.key("$dataTypeDefinitions");
				boolean hasDataTypes = false;
				Map<String, DataType> includeDataTypes = context
						.getIncludeDataTypes();
				if (includeDataTypes != null && !includeDataTypes.isEmpty()) {
					Map<String, DataType> outputDataTypes = new HashMap<String, DataType>();
					for (Map.Entry<String, DataType> entry : includeDataTypes
							.entrySet()) {
						String dataTypeName = entry.getKey();
						if (!context.isDataTypeLoaded(dataTypeName)) {
							outputDataTypes.put(dataTypeName, entry.getValue());
						}
					}
					if (!outputDataTypes.isEmpty()) {
						outputDataTypes(outputDataTypes, context);
						hasDataTypes = true;
					}
				}
				if (!hasDataTypes) {
					jsonBuilder.array().endArray();
				}
				jsonBuilder.endKey();
			}

			if (viewContext != null) {
				jsonBuilder.key("$context").beginValue();
				dataOutputter.output(viewContext, context);
				jsonBuilder.endValue();
			}

			jsonBuilder.endObject();
		} else {
			outputData(result, context);
		}
	}

	protected void outputDataTypes(Map<String, DataType> includeDataTypes,
			OutputContext outputContext) throws Exception {
		includeDataTypesOutputter.output(includeDataTypes, outputContext);
	}

	protected void outputData(Object result, OutputContext outputContext)
			throws Exception {
		dataOutputter.output(result, outputContext);
	}

	protected ViewConfig getViewConfig(DoradoContext context, String viewName)
			throws Exception {
		ViewConfig viewConfig = (ViewConfig) context.getAttribute(viewName);
		if (viewConfig == null) {
			viewConfig = viewConfigManager.getViewConfig(viewName);
			context.setAttribute(viewName, viewConfig);
		}
		return viewConfig;
	}

	public DataType getDataType(String dataTypeName) throws Exception {
		DataType dataType;
		// 判断是否View中的私有DataType
		if (dataTypeName.startsWith(PRIVATE_VIEW_OBJECT_PREFIX)) {
			DoradoContext context = DoradoContext.getCurrent();
			dataType = (DataType) context.getAttribute(dataTypeName);
			if (dataType == null) {
				ParsedDataObjectName parsedName = new ParsedDataObjectName(
						dataTypeName);
				String viewName = parsedName.getViewName();
				ViewConfig viewConfig = getViewConfig(context, viewName);
				String name = parsedName.getDataObject();
				DataTypeName dtn = new DataTypeName(name);
				if (dtn.getSubDataTypes().length == 1) {
					String subName = dtn.getSubDataTypes()[0];
					if (subName.startsWith(PRIVATE_VIEW_OBJECT_PREFIX)) {
						parsedName = new ParsedDataObjectName(subName);
						name = new StringBuffer()
								.append(dtn.getOriginDataType()).append('[')
								.append(parsedName.getDataObject()).append(']')
								.toString();
					}
				}
				dataType = viewConfig.getDataType(name);
				context.setAttribute(dataTypeName, dataType);
			}
		} else {
			dataType = dataTypeManager.getDataType(dataTypeName);
		}
		return dataType;
	}

	protected Object jsonToJavaObject(JsonNode jsonNode, DataType dataType,
			Class<?> targetType, boolean proxy) throws Exception {
		JsonConvertContext jsonContext = new JsonConvertContextImpl(false,
				false, this);
		return JsonUtils.toJavaObject(jsonNode, dataType, targetType, proxy,
				jsonContext);

	}

}
