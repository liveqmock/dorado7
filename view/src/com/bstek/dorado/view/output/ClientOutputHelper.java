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

package com.bstek.dorado.view.output;

import java.beans.PropertyDescriptor;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.BeanUtils;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.EscapeMode;
import com.bstek.dorado.common.event.ClientEventSupported;
import com.bstek.dorado.core.bean.BeanFactoryUtils;
import com.bstek.dorado.core.bean.BeanWrapper;
import com.bstek.dorado.core.bean.Scope;
import com.bstek.dorado.data.entity.EntityUtils;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.util.Assert;
import com.bstek.dorado.util.clazz.TypeInfo;
import com.bstek.dorado.util.proxy.ProxyBeanUtils;
import com.bstek.dorado.view.annotation.ComponentReference;
import com.bstek.dorado.view.widget.AssembledComponent;
import com.bstek.dorado.view.widget.Component;
import com.bstek.dorado.view.widget.FloatControl;
import com.bstek.dorado.view.widget.datacontrol.DataControl;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-12-2
 */
public class ClientOutputHelper {
	private static final String WILCARD = "*";
	private static final String LISTENER = "listener";
	private static final String DEFAULT_OBJECT_OUTPUTTER = "spring:dorado.objectOutputter";
	private static final String DEFAULT_PROPERTY_OUTPUTTER = "spring:dorado.defaultPropertyOutputter";
	private static final String CLIENT_EVENT_LISTENERS_OUTPUTTER = "spring:dorado.clientEventListenersOutputter";
	private static final String DATA_OUTPUTTER = "spring:dorado.dataOutputter";
	private static final String OBJECT_OUTPUTTER = "spring:dorado.objectOutputterDispatcher";
	private static final String COMPONENT_OUTPUTTER = "spring:dorado.componentOutputterDispatcher";
	private static final String COMPONENT_REFERENCE_OUTPUTTER = "spring:dorado.componentReferencePropertyOutputter";
	private static final String DATA_TYPE_PROPERTY_OUTPUTTER = "spring:dorado.dataTypePropertyOutputter";
	private static final Object FAKE_ESCAPE_VALUE = new Object();

	@SuppressWarnings("unchecked")
	private static final Map<String, PropertyConfig> NULL_MAP = Collections.EMPTY_MAP;
	private static final Map<Class<?>, Outputter> OUTPUTTER_MAP = new HashMap<Class<?>, Outputter>();

	protected static class ClientObjectInfo {
		private List<Class<?>> sourceTypes;

		private String outputter;
		private boolean usePrototype;
		private String prototype;
		private String shortTypeName;
		private EscapeMode escapeMode;
		private Map<String, ClientProperty> propertyConfigs = new HashMap<String, ClientProperty>();

		public void addSourceType(Class<?> sourceType) {
			if (sourceTypes == null) {
				sourceTypes = new ArrayList<Class<?>>();
			}
			sourceTypes.add(sourceType);
		}

		public List<Class<?>> getSourceTypes() {
			return sourceTypes;
		}

		public String getOutputter() {
			return outputter;
		}

		public void setOutputter(String outputter) {
			this.outputter = outputter;
		}

		public boolean isUsePrototype() {
			return usePrototype;
		}

		public void setUsePrototype(boolean usePrototype) {
			this.usePrototype = usePrototype;
		}

		public String getPrototype() {
			return prototype;
		}

		public void setPrototype(String prototype) {
			this.prototype = prototype;
		}

		public String getShortTypeName() {
			return shortTypeName;
		}

		public void setShortTypeName(String shortTypeName) {
			this.shortTypeName = shortTypeName;
		}

		public EscapeMode getEscapeMode() {
			return escapeMode;
		}

		public void setEscapeMode(EscapeMode escapeMode) {
			this.escapeMode = escapeMode;
		}

		public Map<String, ClientProperty> getPropertyConfigs() {
			return propertyConfigs;
		}
	}

	private Map<Class<?>, Map<String, PropertyConfig>> propertyConfigsCache = new HashMap<Class<?>, Map<String, PropertyConfig>>();


	public Outputter getOutputter(Class<?> beanType)
			throws Exception {
		beanType = ProxyBeanUtils.getProxyTargetType(beanType);

		synchronized (beanType) {
			Outputter outputter = OUTPUTTER_MAP.get(beanType);
			if (outputter != null) {
				return outputter;
			}
	
			ClientObjectInfo clientObjectInfo = getClientObjectInfo(beanType);
			String outputterExpr = null;
			if (clientObjectInfo != null) {
				outputterExpr = clientObjectInfo.getOutputter();
			}
			if (StringUtils.isEmpty(outputterExpr)) {
				outputterExpr = DEFAULT_OBJECT_OUTPUTTER;
			}
			BeanWrapper beanWrapper = BeanFactoryUtils.getBean(outputterExpr,
					Scope.instant);
			outputter = (Outputter) beanWrapper.getBean();
	
			if (outputter instanceof ObjectOutputter) {
				ObjectOutputter objectOutputter = (ObjectOutputter) outputter;
				if (clientObjectInfo != null) {
					objectOutputter.setEscapeMode(clientObjectInfo.getEscapeMode());
				}
	
				Map<String, PropertyConfig> propertyConfigs = objectOutputter
						.getPropertieConfigs();
				if (propertyConfigs.get(WILCARD) == null) {
					PropertyConfig propertyConfig = new PropertyConfig();
					beanWrapper = BeanFactoryUtils.getBean(
							DEFAULT_PROPERTY_OUTPUTTER, Scope.instant);
					propertyConfig.setOutputter(beanWrapper.getBean());
					propertyConfigs.put(WILCARD, propertyConfig);
				}
	
				if (objectOutputter instanceof ClientObjectOutputter) {
					ClientObjectOutputter clientObjectOutputter = (ClientObjectOutputter) objectOutputter;
					if (clientObjectInfo != null) {
						clientObjectOutputter.setUsePrototype(clientObjectInfo
								.isUsePrototype());
						clientObjectOutputter.setPrototype(clientObjectInfo
								.getPrototype());
						clientObjectOutputter.setShortTypeName(clientObjectInfo
								.getShortTypeName());
					}
	
					if (ClientEventSupported.class.isAssignableFrom(beanType)) {
						PropertyConfig propertyConfig = new PropertyConfig();
						beanWrapper = BeanFactoryUtils.getBean(
								CLIENT_EVENT_LISTENERS_OUTPUTTER, Scope.instant);
						propertyConfig.setOutputter(beanWrapper.getBean());
						propertyConfigs.put(LISTENER, propertyConfig);
					}
				}
	
				Map<String, PropertyConfig> configs = getPropertyConfigs(beanType);
				if (configs != null) {
					propertyConfigs.putAll(configs);
				}
			}
	
			OUTPUTTER_MAP.put(beanType, outputter);
			return outputter;
		}
	}

	protected ClientObjectInfo getClientObjectInfo(Class<?> beanType) {
		ClientObjectInfo clientObjectInfo = new ClientObjectInfo();
		doGetClientObjectInfo(clientObjectInfo, beanType);
		if (StringUtils.isEmpty(clientObjectInfo.getShortTypeName())
				|| "#className".equals(clientObjectInfo.getShortTypeName())) {
			clientObjectInfo.setShortTypeName(beanType.getSimpleName());
		}
		if (clientObjectInfo.getSourceTypes() == null) {
			clientObjectInfo = null;
		}
		return clientObjectInfo;
	}

	private void doGetClientObjectInfo(ClientObjectInfo clientObjectInfo,
			Class<?> type) {
		for (Class<?> i : type.getInterfaces()) {
			doGetClientObjectInfo(clientObjectInfo, i);
		}

		Class<?> superclass = type.getSuperclass();
		if (superclass != null && !superclass.equals(Object.class)) {
			doGetClientObjectInfo(clientObjectInfo, superclass);
		}

		collectClientObjectInfo(clientObjectInfo, type);
	}

	private void collectClientObjectInfo(ClientObjectInfo clientObjectInfo,
			Class<?> type) {
		ClientObject clientObject = type.getAnnotation(ClientObject.class);
		if (clientObject == null) {
			return;
		}
		clientObjectInfo.addSourceType(type);

		if (StringUtils.isNotEmpty(clientObject.outputter())) {
			clientObjectInfo.setOutputter(clientObject.outputter());
		}
		if (clientObject.usePrototype()) {
			clientObjectInfo.setUsePrototype(true);
		}
		if (StringUtils.isNotEmpty(clientObject.prototype())) {
			clientObjectInfo.setPrototype(clientObject.prototype());
		}
		if (StringUtils.isNotEmpty(clientObject.shortTypeName())) {
			clientObjectInfo.setShortTypeName(clientObject.shortTypeName());
		}
		if (!EscapeMode.AUTO.equals(clientObject.escapeMode())) {
			clientObjectInfo.setEscapeMode(clientObject.escapeMode());
		}

		Map<String, ClientProperty> propertyConfigs = clientObjectInfo
				.getPropertyConfigs();
		ClientProperty[] annotationProperties = clientObject.properties();
		boolean hasPropertyAnnotation = false;
		if (annotationProperties.length == 1) {
			ClientProperty clientProperty = annotationProperties[0];
			hasPropertyAnnotation = StringUtils.isNotEmpty(clientProperty
					.propertyName())
					|| StringUtils.isNotEmpty(clientProperty.outputter());
		}
		if (hasPropertyAnnotation) {
			for (ClientProperty clientProperty : annotationProperties) {
				if (StringUtils.isEmpty(clientProperty.propertyName())) {
					throw new IllegalArgumentException(
							"@ClientProperty.propertyName undefined. ["
									+ type.getName() + "]");
				}
				for (String property : StringUtils.split(clientProperty
						.propertyName())) {
					propertyConfigs.put(property, clientProperty);
				}
			}
		}
	}

	protected Map<String, PropertyConfig> getPropertyConfigs(Class<?> beanType)
			throws Exception {
		beanType = ProxyBeanUtils.getProxyTargetType(beanType);
		Map<String, PropertyConfig> propertyConfigs = propertyConfigsCache
				.get(beanType);
		if (propertyConfigs == NULL_MAP) {
			propertyConfigs = null;
		} else if (propertyConfigs == null) {
			propertyConfigs = doGetPropertyConfigs(beanType);
			propertyConfigsCache.put(beanType,
					(propertyConfigs == null) ? NULL_MAP : propertyConfigs);
		}
		return propertyConfigs;
	}

	protected Map<String, PropertyConfig> doGetPropertyConfigs(Class<?> beanType)
			throws Exception {
		beanType = ProxyBeanUtils.getProxyTargetType(beanType);
		Map<String, PropertyConfig> propertyConfigs = new HashMap<String, PropertyConfig>();

		ClientObjectInfo clientObjectInfo = getClientObjectInfo(beanType);
		if (clientObjectInfo != null) {
			for (Map.Entry<String, ClientProperty> entry : clientObjectInfo
					.getPropertyConfigs().entrySet()) {
				String property = entry.getKey();
				ClientProperty clientProperty = entry.getValue();

				PropertyConfig propertyConfig = new PropertyConfig();
				if (clientProperty.ignored()) {
					propertyConfig.setIgnored(true);
				} else {
					if (StringUtils.isNotEmpty(clientProperty.outputter())) {
						BeanWrapper beanWrapper = BeanFactoryUtils.getBean(
								clientProperty.outputter(), Scope.instant);
						propertyConfig.setOutputter(beanWrapper.getBean());
					}

					if (clientProperty.alwaysOutput()) {
						propertyConfig.setEscapeValue(FAKE_ESCAPE_VALUE);
					} else if (StringUtils.isNotEmpty(clientProperty
							.escapeValue())) {
						propertyConfig.setEscapeValue(clientProperty
								.escapeValue());
					}
				}
				propertyConfigs.put(property, propertyConfig);
			}
		}

		boolean isAssembledComponent = (AssembledComponent.class
				.isAssignableFrom(beanType));
		Class<?> superComponentType = null;
		if (isAssembledComponent) {
			superComponentType = beanType;
			while (superComponentType != null
					&& AssembledComponent.class
							.isAssignableFrom(superComponentType)) {
				superComponentType = superComponentType.getSuperclass();
				Assert.notNull(superComponentType);
			}
		}

		for (PropertyDescriptor propertyDescriptor : PropertyUtils
				.getPropertyDescriptors(beanType)) {
			String property = propertyDescriptor.getName();
			Method readMethod = propertyDescriptor.getReadMethod();
			if (readMethod.getDeclaringClass() != beanType) {
				try {
					readMethod = beanType.getMethod(readMethod.getName(),
							readMethod.getParameterTypes());
				} catch (NoSuchMethodException e) {
					// do nothing
				}
			}

			TypeInfo typeInfo;
			Class<?> propertyType = propertyDescriptor.getPropertyType();
			if (Collection.class.isAssignableFrom(propertyType)) {
				typeInfo = TypeInfo.parse(
						(ParameterizedType) readMethod.getGenericReturnType(),
						true);
				if (typeInfo != null) {
					propertyType = typeInfo.getType();
				}
			} else if (propertyType.isArray()) {
				typeInfo = new TypeInfo(propertyType.getComponentType(), true);
			} else {
				typeInfo = new TypeInfo(propertyType, false);
			}

			PropertyConfig propertyConfig = null;
			ClientProperty clientProperty = readMethod
					.getAnnotation(ClientProperty.class);
			if (clientProperty != null) {
				propertyConfig = new PropertyConfig();
				if (clientProperty.ignored()) {
					propertyConfig.setIgnored(true);
				} else {
					if (StringUtils.isNotEmpty(clientProperty.outputter())) {
						BeanWrapper beanWrapper = BeanFactoryUtils.getBean(
								clientProperty.outputter(), Scope.instant);
						propertyConfig.setOutputter(beanWrapper.getBean());
					} else if (Component.class.isAssignableFrom(propertyType)) {
						BeanWrapper beanWrapper = BeanFactoryUtils.getBean(
								COMPONENT_OUTPUTTER, Scope.instant);
						propertyConfig.setOutputter(beanWrapper.getBean());
					} else if (DataControl.class.isAssignableFrom(propertyType)
							|| FloatControl.class
									.isAssignableFrom(propertyType)) {
						BeanWrapper beanWrapper = BeanFactoryUtils.getBean(
								COMPONENT_OUTPUTTER, Scope.instant);
						propertyConfig.setOutputter(beanWrapper.getBean());
					} else if (DataType.class.isAssignableFrom(propertyType)) {
						BeanWrapper beanWrapper = BeanFactoryUtils.getBean(
								DATA_TYPE_PROPERTY_OUTPUTTER, Scope.instant);
						propertyConfig.setOutputter(beanWrapper.getBean());
					} else if (Object.class.equals(propertyType)) {
						BeanWrapper beanWrapper = BeanFactoryUtils.getBean(
								DATA_OUTPUTTER, Scope.instant);
						propertyConfig.setOutputter(beanWrapper.getBean());
					} else if (!EntityUtils.isSimpleType(propertyType)
							&& !propertyType.isArray()) {
						BeanWrapper beanWrapper = BeanFactoryUtils.getBean(
								OBJECT_OUTPUTTER, Scope.instant);
						propertyConfig.setOutputter(beanWrapper.getBean());
					}

					if (!clientProperty.evaluateExpression()) {
						propertyConfig.setEvaluateExpression(false);
					}

					if (clientProperty.alwaysOutput()) {
						propertyConfig.setEscapeValue(FAKE_ESCAPE_VALUE);
					} else if (StringUtils.isNotEmpty(clientProperty
							.escapeValue())) {
						propertyConfig.setEscapeValue(clientProperty
								.escapeValue());
					}
				}
			} else if (isAssembledComponent
					&& readMethod.getDeclaringClass() == beanType
					&& EntityUtils.isSimpleType(propertyType)) {
				if (BeanUtils.getPropertyDescriptor(superComponentType,
						property) == null) {
					propertyConfig = new PropertyConfig();
					propertyConfig.setIgnored(true);
				}
			}

			ComponentReference componentReference = readMethod
					.getAnnotation(ComponentReference.class);
			if (componentReference != null && String.class.equals(propertyType)) {
				if (propertyConfig == null) {
					propertyConfig = new PropertyConfig();
				}
				if (propertyConfig.getOutputter() == null) {
					BeanWrapper beanWrapper = BeanFactoryUtils.getBean(
							COMPONENT_REFERENCE_OUTPUTTER, Scope.instant);
					propertyConfig.setOutputter(beanWrapper.getBean());
				}
			}

			if (!propertyType.isPrimitive()
					&& (Number.class.isAssignableFrom(propertyType) || Boolean.class
							.isAssignableFrom(propertyType))) {
				if (propertyConfig == null) {
					propertyConfig = new PropertyConfig();
				}
				if (propertyConfig.getEscapeValue() == PropertyConfig.NONE_VALUE) {
					propertyConfig.setEscapeValue(null);
				}
			}

			if (propertyConfig != null) {
				propertyConfigs.put(property, propertyConfig);
			}
		}
		return (propertyConfigs.isEmpty()) ? null : propertyConfigs;
	}
}
