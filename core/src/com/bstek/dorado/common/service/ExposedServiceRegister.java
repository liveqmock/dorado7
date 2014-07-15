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

package com.bstek.dorado.common.service;

import java.util.Map;

import org.springframework.beans.factory.InitializingBean;

import com.bstek.dorado.spring.RemovableBean;
import com.bstek.dorado.util.Assert;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-1-21
 */
public class ExposedServiceRegister implements InitializingBean, RemovableBean {
	private ExposedServiceManager exposedServiceManager;
	private Map<String, String> services;

	public void setExposedServiceManager(
			ExposedServiceManager exposedServiceManager) {
		this.exposedServiceManager = exposedServiceManager;
	}

	public void setServices(Map<String, String> services) {
		this.services = services;
	}

	public void afterPropertiesSet() throws Exception {
		if (services != null) {
			synchronized (exposedServiceManager) {
				for (Map.Entry<String, String> entry : services.entrySet()) {
					String name = entry.getKey(), service = entry.getValue();
					Assert.notEmpty(name);
					Assert.notEmpty(service);

					String bean, method = null;
					int i = service.lastIndexOf('#');
					if (i > 0) {
						bean = service.substring(0, i);
						method = service.substring(i + 1);
					} else {
						bean = service;
					}

					ExposedServiceDefintion exposedService = new ExposedServiceDefintion();
					exposedService.setName(name);
					exposedService.setBean(bean);
					exposedService.setMethod(method);
					exposedServiceManager.registerService(exposedService);
				}
			}
		}
	}
}
