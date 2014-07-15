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

package com.bstek.dorado.view.manager;

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.annotation.XmlSubNode;
import com.bstek.dorado.common.MetaDataSupport;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.bean.Scopable;
import com.bstek.dorado.core.bean.Scope;
import com.bstek.dorado.data.provider.DataProvider;
import com.bstek.dorado.data.resolver.DataResolver;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.util.proxy.BeanExtender;
import com.bstek.dorado.view.PrivateDataProviderManager;
import com.bstek.dorado.view.PrivateDataResolverManager;
import com.bstek.dorado.view.PrivateDataTypeManager;
import com.bstek.dorado.view.View;
import com.bstek.dorado.view.ViewState;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-7-11
 */
@XmlNode(definitionType = "com.bstek.dorado.view.config.definition.ViewConfigDefinition", properties = { @XmlProperty(propertyName = "template", attributeOnly = true, ignored = true) }, subNodes = {
		@XmlSubNode(nodeName = "Model", parser = "spring:dorado.viewModelParser", resultProcessed = true),
		@XmlSubNode(nodeName = "Arguments", parser = "spring:dorado.viewArgumentsParser", resultProcessed = true),
		@XmlSubNode(nodeName = "Context", parser = "spring:dorado.viewContextParser", resultProcessed = true) })
public class ViewConfig implements Scopable, MetaDataSupport {
	protected static final String VIEW_STATE_ATTRIBUTE_KEY = ViewState.class
			.getName();

	private String name;
	private Scope scope = Scope.thread;
	private Map<String, Object> metaData;
	private Map<String, Object> arguments = new HashMap<String, Object>();
	private PrivateDataTypeManager innerDataTypeManager;
	private PrivateDataProviderManager innerDataProviderManager;
	private PrivateDataResolverManager innerDataResolverManager;
	private View view;

	public ViewConfig(String name) {
		this.name = name;
	}

	@XmlProperty(unsupported = true)
	@ClientProperty(ignored = true)
	@IdeProperty(visible = false)
	public String getName() {
		return name;
	}

	@ClientProperty(escapeValue = "request", ignored = true)
	public Scope getScope() {
		return scope;
	}

	public void setScope(Scope scope) {
		this.scope = scope;
	}

	@XmlProperty(unsupported = true)
	@IdeProperty(visible = false)
	public ViewState getState() {
		ViewState viewState = (ViewState) Context.getCurrent().getAttribute(
				VIEW_STATE_ATTRIBUTE_KEY);
		return (viewState == null) ? ViewState.rendering : viewState;
	}

	@XmlProperty(composite = true)
	public Map<String, Object> getMetaData() {
		return metaData;
	}

	public void setMetaData(Map<String, Object> metaData) {
		this.metaData = metaData;
	}

	public Map<String, Object> getArguments() {
		return arguments;
	}

	public void setDataTypeManager(PrivateDataTypeManager innerDataTypeManager) {
		this.innerDataTypeManager = innerDataTypeManager;
	}

	public void setDataProviderManager(
			PrivateDataProviderManager innerDataProviderManager) {
		this.innerDataProviderManager = innerDataProviderManager;
	}

	public void setDataResolverManager(
			PrivateDataResolverManager innerDataResolverManager) {
		this.innerDataResolverManager = innerDataResolverManager;
	}

	public DataType getDataType(String name) throws Exception {
		return (innerDataTypeManager == null) ? null : innerDataTypeManager
				.getDataType(name);
	}

	@SuppressWarnings("unchecked")
	public Set<String> getPrivateDataTypeNames() {
		if (innerDataTypeManager != null) {
			Set<String> names = new HashSet<String>();
			for (String name : innerDataTypeManager.getPrivateDataTypeNames()) {
				if (name.indexOf("[") < 0) {
					names.add(name);
				}
			}
			return names;
		} else {
			return Collections.EMPTY_SET;
		}
	}

	public DataProvider getDataProvider(String name) throws Exception {
		return (innerDataProviderManager == null) ? null
				: innerDataProviderManager.getDataProvider(name);
	}

	public DataResolver getDataResolver(String name) throws Exception {
		return (innerDataResolverManager == null) ? null
				: innerDataResolverManager.getDataResolver(name);
	}

	public DataType createDataType(String name) throws Exception {
		return createDataType(name, "Entity");
	}

	public DataType createDataType(String name, String parent) throws Exception {
		if (innerDataTypeManager == null) {
			throw new NullPointerException("[innerDataTypeManager] undefined.");
		}

		if (innerDataTypeManager.getDataType(name) != null) {
			throw new IllegalArgumentException("DataType [" + name
					+ "] already exists.");
		}

		DataType dataType = innerDataTypeManager.createDataType(name, parent);
		dataType = (DataType) BeanExtender.setExProperty(dataType,
				"dorado.dynamicDataType", Boolean.TRUE);
		return dataType;
	}

	@XmlSubNode(resultProcessed = true)
	@IdeProperty(visible = false)
	public View getView() {
		return view;
	}

	public void setView(View view) {
		this.view = view;
	}

}
