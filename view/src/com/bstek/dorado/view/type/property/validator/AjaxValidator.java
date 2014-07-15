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

package com.bstek.dorado.view.type.property.validator;

import java.lang.reflect.Method;

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.common.service.ExposedServiceDefintion;
import com.bstek.dorado.common.service.ExposedServiceManager;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.bean.BeanFactoryUtils;
import com.bstek.dorado.data.method.MethodAutoMatchingUtils;
import com.bstek.dorado.view.annotation.ComponentReference;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-5-25
 */
@XmlNode(fixedProperties = "type=ajax", parser = "spring:dorado.ajaxValidatorParser")
@ClientObject(prototype = "dorado.validator.AjaxValidator", shortTypeName = "Ajax")
@ClientEvents(@ClientEvent(name = "beforeExecute"))
public class AjaxValidator extends AbstractAjaxValidator {
	private static ExposedServiceManager exposedServiceManager;

	private String service;
	private String ajaxAction;

	private ExposedServiceManager getExposedServiceManager() throws Exception {
		if (exposedServiceManager == null) {
			exposedServiceManager = (ExposedServiceManager) Context
					.getCurrent().getServiceBean("exposedServiceManager");
		}
		return exposedServiceManager;
	}

	@IdeProperty(highlight = 1)
	public String getService() {
		return service;
	}

	public void setService(String service) {
		this.service = service;
	}

	@ComponentReference("AjaxAction")
	public String getAjaxAction() {
		return ajaxAction;
	}

	public void setAjaxAction(String ajaxAction) {
		this.ajaxAction = ajaxAction;
	}

	@Override
	protected Object doValidate(Object value) throws Exception {
		ExposedServiceDefintion exposedService = getExposedServiceManager()
				.getService(service);
		if (exposedService == null) {
			throw new IllegalArgumentException("Unknown ExposedService ["
					+ service + "].");
		}

		Object serviceBean = BeanFactoryUtils.getBean(exposedService.getBean());
		Method[] methods = MethodAutoMatchingUtils.getMethodsByName(
				serviceBean.getClass(), exposedService.getMethod());
		if (methods.length == 0) {
			throw new NoSuchMethodException("Method ["
					+ exposedService.getMethod() + "] not found in ["
					+ exposedService.getBean() + "].");
		}

		String[] optionalParameterNames = new String[] { "value" };
		Object[] optionalParameters = new Object[] { value };
		Object returnValue = MethodAutoMatchingUtils.invokeMethod(methods,
				serviceBean, null, null, optionalParameterNames,
				optionalParameters, null, null);
		return returnValue;
	}

}
