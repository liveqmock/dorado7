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

package com.bstek.dorado.core.bean;

import java.util.List;

import org.springframework.beans.factory.InitializingBean;

import com.bstek.dorado.spring.RemovableBean;

/**
 * 用于利用外部的Spring配置文件完成Bean工厂注册功能的辅助类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Dec 26, 2007
 */
public class BeanFactoryRegister implements InitializingBean, RemovableBean {
	private BeanFactoryRegistry beanFactoryRegistry;
	private List<BeanFactory> beanFactories;

	public void setBeanFactoryRegistry(BeanFactoryRegistry beanFactoryRegistry) {
		this.beanFactoryRegistry = beanFactoryRegistry;
	}

	/**
	 * 设置要注册的Bean工厂的集合。
	 */
	public void setBeanFactories(List<BeanFactory> beanFactories) {
		this.beanFactories = beanFactories;
	}

	public void afterPropertiesSet() throws Exception {
		for (BeanFactory factory : beanFactories) {
			beanFactoryRegistry.registerBeanFactory(factory);
		}
	}
}
