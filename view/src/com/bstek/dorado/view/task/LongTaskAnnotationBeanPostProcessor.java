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

package com.bstek.dorado.view.task;

import java.lang.reflect.Method;
import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.support.MergedBeanDefinitionPostProcessor;
import org.springframework.beans.factory.support.RootBeanDefinition;

import com.bstek.dorado.common.service.ExposedServiceDefintion;
import com.bstek.dorado.common.service.ExposedServiceManager;
import com.bstek.dorado.core.EngineStartupListener;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-11-29
 */
public class LongTaskAnnotationBeanPostProcessor extends EngineStartupListener
		implements MergedBeanDefinitionPostProcessor {
	private ExposedServiceManager exposedServiceManager;
	private Set<PendingObject> pendingDataObjects = new HashSet<PendingObject>();

	public LongTaskAnnotationBeanPostProcessor() {
		// should execute after
		// com.bstek.dorado.common.service.ExposedServiceAnnotationBeanPostProcessor
		setOrder(1000);
	}

	public void setExposedServiceManager(
			ExposedServiceManager exposedServiceManager) {
		this.exposedServiceManager = exposedServiceManager;
	}

	@SuppressWarnings("rawtypes")
	public void postProcessMergedBeanDefinition(
			RootBeanDefinition beanDefinition, Class beanType, String beanName) {
		for (Method method : beanType.getMethods()) {
			com.bstek.dorado.annotation.TaskScheduler annotation = method
					.getAnnotation(com.bstek.dorado.annotation.TaskScheduler.class);
			if (annotation != null) {
				String serviceName = beanName + '#' + method.getName();
				pendingDataObjects.add(new PendingObject(annotation,
						serviceName));
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

	private void autoRegisterLongTask(PendingObject pendingObject)
			throws Exception {
		String serviceName = pendingObject.getServiceName();
		ExposedServiceDefintion exposedService = exposedServiceManager
				.getService(serviceName);
		if (exposedService != null) {
			com.bstek.dorado.annotation.TaskScheduler annotation = pendingObject
					.getAnnotation();
			LongTaskDefinition def = new LongTaskDefinition(serviceName);
			def.setSchedular(annotation.impl());
			def.setScope(annotation.scope());
			def.setMaxRunning(annotation.maxRunning());
			def.setMaxWaiting(annotation.maxWaiting());
			exposedService.setExDefinition(def);
		}
	}

	@Override
	public void onStartup() throws Exception {
		for (PendingObject pendingObject : pendingDataObjects) {
			autoRegisterLongTask(pendingObject);
		}
		pendingDataObjects.clear();
	}
}

class PendingObject {
	private com.bstek.dorado.annotation.TaskScheduler annotation;
	private String serviceName;

	public PendingObject(com.bstek.dorado.annotation.TaskScheduler annotation,
			String serviceName) {
		this.annotation = annotation;
		this.serviceName = serviceName;
	}

	public com.bstek.dorado.annotation.TaskScheduler getAnnotation() {
		return annotation;
	}

	public String getServiceName() {
		return serviceName;
	}

	@Override
	public boolean equals(Object obj) {
		if (obj == null || !(obj instanceof PendingObject))
			return false;
		return (serviceName != null) ? serviceName
				.equals(((PendingObject) obj).serviceName) : super.equals(obj);
	}

	@Override
	public int hashCode() {
		return (serviceName != null) ? serviceName.hashCode() : super
				.hashCode();
	}
}
