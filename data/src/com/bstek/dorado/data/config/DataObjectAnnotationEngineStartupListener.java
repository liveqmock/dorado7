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

package com.bstek.dorado.data.config;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.HashSet;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.support.MergedBeanDefinitionPostProcessor;
import org.springframework.beans.factory.support.RootBeanDefinition;

import com.bstek.dorado.annotation.DataProvider;
import com.bstek.dorado.annotation.DataResolver;
import com.bstek.dorado.core.EngineStartupListener;
import com.bstek.dorado.core.bean.Scope;
import com.bstek.dorado.data.config.definition.DataProviderDefinition;
import com.bstek.dorado.data.config.definition.DataProviderDefinitionManager;
import com.bstek.dorado.data.config.definition.DataResolverDefinition;
import com.bstek.dorado.data.config.definition.DataResolverDefinitionManager;

/**
 * 用与在Dorado引擎启动时自动完成数据模型配置文件的初始装载过程的监听类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Dec 12, 2007
 * @see com.bstek.dorado.core.EngineStartupListener
 */
public class DataObjectAnnotationEngineStartupListener extends
		EngineStartupListener implements MergedBeanDefinitionPostProcessor {
	private static final String DEFAULT_DATA_PROVIDER = "com.bstek.dorado.data.provider.DirectDataProvider";
	private static final String DEFAULT_DATA_RESOLVER = "com.bstek.dorado.data.resolver.DirectDataResolver";
	private static final Scope DEFAULT_DATA_PROVIDER_SCOPE = null;
	private static final Scope DEFAULT_DATA_RESOLVER_SCOPE = null;
	private static final String BEAN_NAME_PREFIX = "spring:";

	private static final Log logger = LogFactory
			.getLog(DataObjectAnnotationEngineStartupListener.class);

	private DataProviderDefinitionManager dataProviderDefinitionManager;
	private DataResolverDefinitionManager dataResolverDefinitionManager;
	private Set<PendingDataObject> pendingDataObjects = new HashSet<PendingDataObject>();

	public void setDataProviderDefinitionManager(
			DataProviderDefinitionManager dataProviderDefinitionManager) {
		this.dataProviderDefinitionManager = dataProviderDefinitionManager;
	}

	public void setDataResolverDefinitionManager(
			DataResolverDefinitionManager dataResolverDefinitionManager) {
		this.dataResolverDefinitionManager = dataResolverDefinitionManager;
	}

	@SuppressWarnings("rawtypes")
	public void postProcessMergedBeanDefinition(
			RootBeanDefinition beanDefinition, Class beanType, String beanName) {
		for (Method method : beanType.getMethods()) {
			DataProvider dataProviderAnnotation = method
					.getAnnotation(DataProvider.class);
			if (dataProviderAnnotation != null) {
				pendingDataObjects.add(new PendingDataObject(
						DataObjectType.dataProvider, dataProviderAnnotation,
						beanName, method.getName()));
			}

			DataResolver dataResolverAnnotation = method
					.getAnnotation(DataResolver.class);
			if (dataResolverAnnotation != null) {
				pendingDataObjects.add(new PendingDataObject(
						DataObjectType.dataResolver, dataResolverAnnotation,
						beanName, method.getName()));
			}
		}
	}

	public Object postProcessAfterInitialization(Object bean, String beanName)
			throws BeansException {
		return bean;
	}

	public Object postProcessBeforeInitialization(Object bean, String beanName)
			throws BeansException {
		return bean;
	}

	protected String autoRegisterDataObject(PendingDataObject pendingDataObject)
			throws Exception {
		Annotation annotation = pendingDataObject.getAnnotation();
		String beanName = pendingDataObject.getBeanName();
		String methodName = pendingDataObject.getMethodName();
		DataObjectType type = pendingDataObject.getType();
		String dataObjectName = null;

		if (DataObjectType.dataProvider.equals(type)) {
			DataProvider dataProvider = (DataProvider) annotation;
			if (StringUtils.isNotEmpty(dataProvider.name())) {
				dataObjectName = dataProvider.name();
			} else {
				dataObjectName = beanName + "#" + methodName;
			}
			DataProviderDefinition definition = dataProviderDefinitionManager
					.getDefinition(dataObjectName);
			if (definition == null) {
				definition = new DataProviderDefinition();
				definition.setName(dataObjectName);
				definition.setScope(DEFAULT_DATA_PROVIDER_SCOPE);
				definition.setImpl(DEFAULT_DATA_PROVIDER);
				definition.setInterceptor(BEAN_NAME_PREFIX + dataObjectName);
				dataProviderDefinitionManager.registerDefinition(
						dataObjectName, definition);
			}
		} else if (DataObjectType.dataResolver.equals(type)) {
			DataResolver dataResolver = (DataResolver) annotation;
			if (StringUtils.isNotEmpty(dataResolver.name())) {
				dataObjectName = dataResolver.name();
			} else {
				dataObjectName = beanName + "#" + methodName;
			}
			DataResolverDefinition definition = dataResolverDefinitionManager
					.getDefinition(dataObjectName);
			if (definition == null) {
				definition = new DataResolverDefinition();
				definition.setName(dataObjectName);
				definition.setScope(DEFAULT_DATA_RESOLVER_SCOPE);
				definition.setImpl(DEFAULT_DATA_RESOLVER);
				definition.setInterceptor(BEAN_NAME_PREFIX + dataObjectName);
				dataResolverDefinitionManager.registerDefinition(
						dataObjectName, definition);
			}
		}
		return dataObjectName;
	}

	@Override
	public void onStartup() throws Exception {
		StringBuffer dataObjectsText = new StringBuffer();
		for (PendingDataObject pendingDataObject : pendingDataObjects) {
			String dataObjectName = autoRegisterDataObject(pendingDataObject);
			if (StringUtils.isNotEmpty(dataObjectName)) {
				if (dataObjectsText.length() > 0) {
					dataObjectsText.append(',');
				}
				dataObjectsText.append(dataObjectName);
			}
		}
		pendingDataObjects.clear();

		if (dataObjectsText.length() > 0) {
			logger.info("Registered DataObjects(via Annotation): ["
					+ dataObjectsText + "]");
		}
	}
}

enum DataObjectType {
	dataType, dataProvider, dataResolver
}

class PendingDataObject {
	private DataObjectType type;
	private Annotation annotation;
	private String beanName;
	private String methodName;
	private String uniqueName;

	public PendingDataObject(DataObjectType type, Annotation annotation,
			String beanName, String methodName) {
		this.type = type;
		this.annotation = annotation;
		this.beanName = beanName;
		this.methodName = methodName;
		uniqueName = String.valueOf(type) + ':' + beanName + '#' + methodName;
	}

	public DataObjectType getType() {
		return type;
	}

	public Annotation getAnnotation() {
		return annotation;
	}

	public String getBeanName() {
		return beanName;
	}

	public String getMethodName() {
		return methodName;
	}

	@Override
	public boolean equals(Object obj) {
		if (obj == null || !(obj instanceof PendingDataObject))
			return false;
		return (uniqueName != null) ? uniqueName
				.equals(((PendingDataObject) obj).uniqueName) : super
				.equals(obj);
	}

	@Override
	public int hashCode() {
		return (uniqueName != null) ? uniqueName.hashCode() : super.hashCode();
	}
}
