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

import org.springframework.beans.factory.InitializingBean;
import org.springframework.core.Ordered;

import com.bstek.dorado.spring.RemovableBean;
import com.bstek.dorado.util.Assert;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-7-15
 */
public class ViewConfigFactoryRegister implements InitializingBean, Ordered,
		RemovableBean {
	private ViewConfigManager viewConfigManager;
	private String viewNamePattern;
	private Object viewConfigFactory;
	private int order = 999;

	public void setViewConfigManager(ViewConfigManager viewConfigManager) {
		this.viewConfigManager = viewConfigManager;
	}

	public void setViewNamePattern(String viewNamePattern) {
		this.viewNamePattern = viewNamePattern;
	}

	public void setViewConfigFactory(Object viewConfigFactory) {
		this.viewConfigFactory = viewConfigFactory;
	}

	public void afterPropertiesSet() throws Exception {
		Assert.notEmpty(viewNamePattern);
		Assert.notNull(viewConfigFactory);
		viewConfigManager.registerViewConfigFactory(viewNamePattern,
				viewConfigFactory);
	}

	public int getOrder() {
		return order;
	}

	public void setOrder(int order) {
		this.order = order;
	}

}
