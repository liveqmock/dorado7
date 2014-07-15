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

package com.bstek.dorado.view.config.definition;

import java.util.Enumeration;
import java.util.Map;

import org.aopalliance.intercept.MethodInterceptor;
import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.jexl2.JexlContext;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.reflect.MethodUtils;

import com.bstek.dorado.annotation.ResourceInjection;
import com.bstek.dorado.config.definition.CreationContext;
import com.bstek.dorado.config.definition.Definition;
import com.bstek.dorado.config.definition.DefinitionManager;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.bean.BeanWrapper;
import com.bstek.dorado.core.el.ExpressionHandler;
import com.bstek.dorado.core.resource.ListableResourceBundle;
import com.bstek.dorado.data.config.definition.DataProviderDefinition;
import com.bstek.dorado.data.config.definition.DataResolverDefinition;
import com.bstek.dorado.data.config.definition.DataTypeDefinition;
import com.bstek.dorado.data.config.definition.ListenableObjectDefinition;
import com.bstek.dorado.data.provider.manager.DataProviderManager;
import com.bstek.dorado.data.resolver.manager.DataResolverManager;
import com.bstek.dorado.data.type.manager.DataTypeManager;
import com.bstek.dorado.util.proxy.BeanExtender;
import com.bstek.dorado.util.proxy.BeanExtenderMethodInterceptor;
import com.bstek.dorado.view.PrivateDataProviderManager;
import com.bstek.dorado.view.PrivateDataResolverManager;
import com.bstek.dorado.view.PrivateDataTypeManager;
import com.bstek.dorado.view.ViewState;
import com.bstek.dorado.view.config.PrivateDataProviderDefinitionManager;
import com.bstek.dorado.view.config.PrivateDataResolverDefinitionManager;
import com.bstek.dorado.view.config.PrivateDataTypeDefinitionManager;
import com.bstek.dorado.view.manager.ViewConfig;
import com.bstek.dorado.view.manager.ViewCreationContext;
import com.bstek.dorado.view.resource.ViewResourceManager;
import com.bstek.dorado.web.DoradoContext;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-7-11
 */
public class ViewConfigDefinition extends ListenableObjectDefinition {
	private static final String[] DEFAULT_PROPERTIES = new String[] {
			"caption", "label", "title" };
	private static final Class<?>[] CONSTRUCTOR_ARG_TYPES = new Class<?>[] { String.class };
	private static final String VIEW_STATE_ATTRIBUTE_KEY = ViewState.class
			.getName();

	public static final String ARGUMENT = "argument";
	public static final String RESOURCE_RELATIVE_DEFINITION = "resourceRelativeDefinition";

	private Map<String, Object> arguments;
	private Map<String, Object> viewContext;
	private ViewDefinition viewDefinition;

	private PrivateDataTypeDefinitionManager dataTypeDefinitionManager;
	private PrivateDataProviderDefinitionManager dataProviderDefinitionManager;
	private PrivateDataResolverDefinitionManager dataResolverDefinitionManager;

	public ViewConfigDefinition(
			PrivateDataTypeDefinitionManager dataTypeDefinitionManager,
			PrivateDataProviderDefinitionManager dataProviderDefinitionManager,
			PrivateDataResolverDefinitionManager dataResolverDefinitionManager)
			throws Exception {
		setConstructorArgTypes(CONSTRUCTOR_ARG_TYPES);

		this.dataTypeDefinitionManager = dataTypeDefinitionManager;
		this.dataProviderDefinitionManager = dataProviderDefinitionManager;
		this.dataResolverDefinitionManager = dataResolverDefinitionManager;

		dataTypeDefinitionManager.setViewConfigDefinition(this);
		dataProviderDefinitionManager.setViewConfigDefinition(this);
		dataResolverDefinitionManager.setViewConfigDefinition(this);
	}

	/**
	 * 返回用于管理视图中私有DataType的配置声明管理器。
	 */
	public DefinitionManager<DataTypeDefinition> getDataTypeDefinitionManager() {
		return dataTypeDefinitionManager;
	}

	/**
	 * 返回用于管理视图中私有DataProvider的配置声明管理器。
	 */
	public DefinitionManager<DataProviderDefinition> getDataProviderDefinitionManager() {
		return dataProviderDefinitionManager;
	}

	/**
	 * 返回用于管理视图中私有DataResolver的配置声明管理器。
	 */
	public DefinitionManager<DataResolverDefinition> getDataResolverDefinitionManager() {
		return dataResolverDefinitionManager;
	}

	/**
	 * 返回所有视图参数的Map集合。
	 * 
	 * @return 所有视图参数的Map集合。其中该Map集合的键为参数的名称，值为参数值。
	 */
	public Map<String, Object> getArguments() {
		return arguments;
	}

	public void setArguments(Map<String, Object> arguments) {
		this.arguments = arguments;
	}

	public Map<String, Object> getViewContext() {
		return viewContext;
	}

	public void setViewContext(Map<String, Object> viewContext) {
		this.viewContext = viewContext;
	}

	public ViewDefinition getViewDefinition() {
		return viewDefinition;
	}

	public void setViewDefinition(ViewDefinition viewDefinition) {
		this.viewDefinition = viewDefinition;
	}

	private void throwInvalidResourceKey(String key) {
		throw new IllegalArgumentException("Invalid resource key \"" + key
				+ "\".");
	}

	protected void injectResourceString(ViewConfig viewConfig, String key,
			String resourceString) throws Exception {
		Object object = viewConfig;
		ResourceInjection resourceInjection = object.getClass().getAnnotation(
				ResourceInjection.class);

		String[] sections = StringUtils.split(key, ".");
		int len = sections.length;
		for (int i = 0; i < len; i++) {
			String section = sections[i];
			boolean isObject = section.charAt(0) == '#';
			if (isObject) {
				section = section.substring(1);
			}

			if (i == 0 && section.equals("view")) {
				object = viewConfig.getView();
			} else if (isObject) {
				if (object == viewConfig) {
					object = viewConfig.getDataType(section);
					if (object == null && viewConfig.getView() != null) {
						object = viewConfig.getView().getViewElement(section);
					}
				} else {
					if (resourceInjection == null) {
						throwInvalidResourceKey(key);
					}
					String methodName = resourceInjection.subObjectMethod();
					if (StringUtils.isEmpty(methodName)) {
						throwInvalidResourceKey(key);
					}
					object = MethodUtils.invokeExactMethod(object, methodName,
							new String[] { section });
				}
				if (object == null) {
					break;
				}
				resourceInjection = object.getClass().getAnnotation(
						ResourceInjection.class);

				if (i == len - 1) {
					String[] defaultProperties;
					if (resourceInjection == null) {
						defaultProperties = DEFAULT_PROPERTIES;
					} else {
						defaultProperties = resourceInjection.defaultProperty();
					}

					boolean found = false;
					for (String property : defaultProperties) {
						if (PropertyUtils.isWriteable(object, property)) {
							if (PropertyUtils.getSimpleProperty(object,
									property) == null) {
								PropertyUtils.setSimpleProperty(object,
										property, resourceString);
							}
							found = true;
							break;
						}
					}
					if (!found) {
						throwInvalidResourceKey(key);
					}
				}
			} else {
				if (i == len - 1) {
					if (PropertyUtils.getSimpleProperty(object, section) == null) {
						PropertyUtils.setSimpleProperty(object, section,
								resourceString);
					}
				} else {
					object = PropertyUtils.getSimpleProperty(object, section);
				}
			}
		}
	}

	@Override
	protected Object doCreate(CreationContext context, Object[] constuctorArgs)
			throws Exception {
		Context doradoContext = Context.getCurrent();
		ExpressionHandler expressionHandler = (ExpressionHandler) doradoContext
				.getServiceBean("expressionHandler");
		JexlContext jexlContext = expressionHandler.getJexlContext();

		Object originArgumentsVar = jexlContext.get(ARGUMENT);
		jexlContext.set(ARGUMENT, arguments);

		Definition resourceRelativeDefinition = (Definition) jexlContext
				.get(RESOURCE_RELATIVE_DEFINITION);
		jexlContext.set(RESOURCE_RELATIVE_DEFINITION, this);

		Object oldDtdm = doradoContext.getAttribute(Context.THREAD,
				"privateDataTypeDefinitionManager");
		Object oldDpdm = doradoContext.getAttribute(Context.THREAD,
				"privateDataProviderDefinitionManager");
		Object oldDrdm = doradoContext.getAttribute(Context.THREAD,
				"privateDataResolverDefinitionManager");

		doradoContext.setAttribute(Context.THREAD,
				"privateDataTypeDefinitionManager",
				dataTypeDefinitionManager.duplicate());
		doradoContext.setAttribute(Context.THREAD,
				"privateDataProviderDefinitionManager",
				dataProviderDefinitionManager.duplicate());
		doradoContext.setAttribute(Context.THREAD,
				"privateDataResolverDefinitionManager",
				dataResolverDefinitionManager.duplicate());
		try {
			ViewConfig viewConfig = (ViewConfig) super.doCreate(context,
					constuctorArgs);

			ViewResourceManager viewResourceManager = (ViewResourceManager) doradoContext
					.getServiceBean("viewResourceManager");
			ListableResourceBundle bundle = (ListableResourceBundle) viewResourceManager
					.getBundle(this);
			if (bundle != null) {
				for (Enumeration<String> enumeration = bundle.getKeys(); enumeration
						.hasMoreElements();) {
					String key = enumeration.nextElement();
					if (key.charAt(0) == '#') {
						String resourceString = bundle.getString(key);
						injectResourceString(viewConfig, key, resourceString);
					}
				}
			}

			return viewConfig;
		} finally {
			jexlContext.set(ARGUMENT, originArgumentsVar);
			jexlContext.set(RESOURCE_RELATIVE_DEFINITION,
					resourceRelativeDefinition);

			doradoContext.setAttribute(Context.THREAD,
					"privateDataTypeDefinitionManager", oldDtdm);
			doradoContext.setAttribute(Context.THREAD,
					"privateDataProviderDefinitionManager", oldDpdm);
			doradoContext.setAttribute(Context.THREAD,
					"privateDataResolverDefinitionManager", oldDrdm);
		}
	}

	@Override
	protected BeanWrapper createObject(CreationInfo creationInfo,
			Object[] constuctorArgs, MethodInterceptor[] methodInterceptors,
			CreationContext context) throws Exception {
		ViewState viewState = (ViewState) Context.getCurrent().getAttribute(
				VIEW_STATE_ATTRIBUTE_KEY);
		if (viewState == null || ViewState.rendering.equals(viewState)) {
			if (viewContext != null && !viewContext.isEmpty()) {
				DoradoContext doradoContext = DoradoContext.getCurrent();
				for (Map.Entry<String, Object> entry : viewContext.entrySet()) {
					doradoContext
							.setAttribute(
									DoradoContext.VIEW,
									entry.getKey(),
									getFinalValueOrExpression(entry.getValue(),
											context));
				}
			}
		}

		BeanExtenderMethodInterceptor bemi = new BeanExtenderMethodInterceptor();
		if (methodInterceptors == null) {
			methodInterceptors = new MethodInterceptor[] { bemi };
		} else {
			MethodInterceptor[] newMis = new MethodInterceptor[methodInterceptors.length + 1];
			System.arraycopy(methodInterceptors, 0, newMis, 0,
					methodInterceptors.length);
			newMis[methodInterceptors.length] = bemi;
			methodInterceptors = newMis;
		}

		BeanWrapper wrapper = super.createObject(creationInfo, constuctorArgs,
				methodInterceptors, context);
		BeanExtender.setExProperty(wrapper.getBean(), "viewConfigDefinition",
				this);
		return wrapper;
	}

	@Override
	protected void doInitObject(Object object, CreationInfo creationInfo,
			CreationContext context) throws Exception {
		ViewCreationContext viewCreationContext = (ViewCreationContext) context;
		ViewConfig viewConfig = (ViewConfig) object;
		viewCreationContext.setViewConfig(viewConfig);
		try {
			super.doInitObject(object, creationInfo, context);

			Context doradoContext = Context.getCurrent();
			PrivateDataTypeDefinitionManager innerDataTypeDefinitionManager = (PrivateDataTypeDefinitionManager) doradoContext
					.getAttribute(Context.THREAD,
							"privateDataTypeDefinitionManager");
			PrivateDataProviderDefinitionManager innerDataProviderDefinitionManager = (PrivateDataProviderDefinitionManager) doradoContext
					.getAttribute(Context.THREAD,
							"privateDataProviderDefinitionManager");
			PrivateDataResolverDefinitionManager innerDataResolverDefinitionManager = (PrivateDataResolverDefinitionManager) doradoContext
					.getAttribute(Context.THREAD,
							"privateDataResolverDefinitionManager");

			PrivateDataTypeManager dataTypeManager = new PrivateDataTypeManager(
					(DataTypeManager) doradoContext
							.getServiceBean("dataTypeManager"),
					innerDataTypeDefinitionManager,
					innerDataProviderDefinitionManager,
					innerDataResolverDefinitionManager);

			PrivateDataProviderManager dataProviderManager = new PrivateDataProviderManager(
					(DataProviderManager) doradoContext
							.getServiceBean("dataProviderManager"),
					innerDataTypeDefinitionManager,
					innerDataProviderDefinitionManager,
					innerDataResolverDefinitionManager);

			PrivateDataResolverManager dataResolverManager = new PrivateDataResolverManager(
					(DataResolverManager) doradoContext
							.getServiceBean("dataResolverManager"),
					innerDataTypeDefinitionManager,
					innerDataProviderDefinitionManager,
					innerDataResolverDefinitionManager);

			viewConfig.setDataTypeManager(dataTypeManager);
			viewConfig.setDataProviderManager(dataProviderManager);
			viewConfig.setDataResolverManager(dataResolverManager);

			ViewState viewState = (ViewState) Context.getCurrent()
					.getAttribute(ViewState.class.getName());
			if (viewState == null || ViewState.rendering.equals(viewState)) {
				viewDefinition.create(context, new Object[] { viewConfig });
			}
		} finally {
			viewCreationContext.setViewConfig(null);
		}
	}
}
