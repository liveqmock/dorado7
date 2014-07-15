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

package com.bstek.dorado.view;

import java.lang.reflect.Type;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.apache.commons.jexl2.JexlContext;

import com.bstek.dorado.config.definition.Definition;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.el.ExpressionHandler;
import com.bstek.dorado.data.config.definition.DataTypeDefinition;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.data.type.manager.DataTypeManager;
import com.bstek.dorado.data.type.manager.DefaultDataTypeManager;
import com.bstek.dorado.view.config.PrivateDataProviderDefinitionManager;
import com.bstek.dorado.view.config.PrivateDataResolverDefinitionManager;
import com.bstek.dorado.view.config.PrivateDataTypeDefinitionManager;
import com.bstek.dorado.view.config.definition.ViewConfigDefinition;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-7-21
 */
public class PrivateDataTypeManager extends DefaultDataTypeManager {
	private DataTypeManager parent;
	private Map<String, DataType> privateDataTypeMap;
	private PrivateDataTypeDefinitionManager privateDataTypeDefinitionManager;
	private PrivateDataProviderDefinitionManager privateDataProviderDefinitionManager;
	private PrivateDataResolverDefinitionManager privateDataResolverDefinitionManager;

	public PrivateDataTypeManager(
			DataTypeManager parent,
			PrivateDataTypeDefinitionManager privateDataTypeDefinitionManager,
			PrivateDataProviderDefinitionManager privateDataProviderDefinitionManager,
			PrivateDataResolverDefinitionManager privateDataResolverDefinitionManager) {
		this.setDataTypeDefinitionManager(privateDataTypeDefinitionManager);
		this.privateDataTypeDefinitionManager = privateDataTypeDefinitionManager;
		this.privateDataProviderDefinitionManager = privateDataProviderDefinitionManager;
		this.privateDataResolverDefinitionManager = privateDataResolverDefinitionManager;
		this.parent = parent;
	}

	public DataTypeManager getParent() {
		return parent;
	}

	@Override
	public DataType getDataType(String name) throws Exception {
		DataType dataType = null;
		if (privateDataTypeMap != null) {
			dataType = privateDataTypeMap.get(name);
		}
		if (dataType == null) {
			dataType = super.getDataType(name);
		}
		if (dataType == null && parent != null) {
			dataType = parent.getDataType(name);
		}
		return dataType;
	}

	@Override
	public DataType getDataType(Type type) throws Exception {
		// 不对View中声明的DataType提供根据classType获取DataType的功能支持。
		return (parent != null) ? parent.getDataType(type) : null;
	}

	@Override
	public Set<String> getDataTypeNames() {
		Set<String> names = new HashSet<String>();
		if (parent != null) {
			names.addAll(parent.getDataTypeNames());
		}
		names.addAll(getPrivateDataTypeNames());
		return Collections.unmodifiableSet(names);
	}

	public Set<String> getPrivateDataTypeNames() {
		Set<String> names = new HashSet<String>(super.getDataTypeNames());
		if (privateDataTypeMap != null) {
			names.addAll(privateDataTypeMap.keySet());
		}
		return Collections.unmodifiableSet(names);
	}

	/**
	 * @param name
	 * @param dataType
	 */
	public void registerDataType(String name, DataType dataType) {
		if (privateDataTypeMap == null) {
			privateDataTypeMap = new HashMap<String, DataType>();
		}
		privateDataTypeMap.put(name, dataType);
	}

	@Override
	protected DataType getDataTypeByDefinition(
			DataTypeDefinition dataTypeDefinition) throws Exception {
		ViewConfigDefinition viewConfigDefinition = privateDataTypeDefinitionManager
				.getViewConfigDefinition();

		Context context = Context.getCurrent();
		ExpressionHandler expressionHandler = (ExpressionHandler) context
				.getServiceBean("expressionHandler");
		JexlContext jexlContext = expressionHandler.getJexlContext();

		Object originArgumentsVar = jexlContext
				.get(ViewConfigDefinition.ARGUMENT);
		jexlContext.set(ViewConfigDefinition.ARGUMENT,
				viewConfigDefinition.getArguments());

		Definition resourceRelativeDefinition = (Definition) jexlContext
				.get(ViewConfigDefinition.RESOURCE_RELATIVE_DEFINITION);
		jexlContext.set(ViewConfigDefinition.RESOURCE_RELATIVE_DEFINITION,
				viewConfigDefinition);

		Object oldDtdm = context.getAttribute(Context.THREAD,
				"privateDataTypeDefinitionManager");
		Object oldDpdm = context.getAttribute(Context.THREAD,
				"privateDataProviderDefinitionManager");
		Object oldDrdm = context.getAttribute(Context.THREAD,
				"privateDataResolverDefinitionManager");

		context.setAttribute(Context.THREAD,
				"privateDataTypeDefinitionManager",
				privateDataTypeDefinitionManager);
		context.setAttribute(Context.THREAD,
				"privateDataProviderDefinitionManager",
				privateDataProviderDefinitionManager);
		context.setAttribute(Context.THREAD,
				"privateDataResolverDefinitionManager",
				privateDataResolverDefinitionManager);
		try {
			return super.getDataTypeByDefinition(dataTypeDefinition);
		} finally {
			jexlContext.set(ViewConfigDefinition.ARGUMENT, originArgumentsVar);
			jexlContext.set(ViewConfigDefinition.RESOURCE_RELATIVE_DEFINITION,
					resourceRelativeDefinition);

			context.setAttribute(Context.THREAD,
					"privateDataTypeDefinitionManager", oldDtdm);
			context.setAttribute(Context.THREAD,
					"privateDataProviderDefinitionManager", oldDpdm);
			context.setAttribute(Context.THREAD,
					"privateDataResolverDefinitionManager", oldDrdm);
		}
	}
}
