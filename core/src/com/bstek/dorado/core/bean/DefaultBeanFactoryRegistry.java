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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 默认的Bean工厂的注册管理器实现类。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Dec 26, 2007
 */
public class DefaultBeanFactoryRegistry implements BeanFactoryRegistry {
	private String defaultPrefix;
	private Map<String, BeanFactory> beanFactoryMap = new HashMap<String, BeanFactory>();

	/**
	 * 设置包含Bean工厂注册信息的Map。
	 */
	public void setBeanFactories(List<BeanFactory> beanFactories) {
		this.beanFactoryMap.clear();
		for (BeanFactory factory : beanFactories) {
			registerBeanFactory(factory);
		}
	}

	/**
	 * 返回默认的Bean描述前缀。
	 */
	public String getDefaultPrefix() {
		return defaultPrefix;
	}

	/**
	 * 设置默认的Bean描述前缀。<br>
	 * 即当Bean的描述信息并不包含任何前缀信息时，将采用此属性设定的值来决定决定的处理方式。
	 */
	public void setDefaultPrefix(String defaultPrefix) {
		this.defaultPrefix = defaultPrefix;
	}

	public void registerBeanFactory(BeanFactory beanFactory) {
		beanFactoryMap.put(beanFactory.getBeanNamePrefix(), beanFactory);
	}

	public BeanFactory getBeanFactory(String prefix) {
		if (prefix == null) {
			prefix = defaultPrefix;
		}
		return beanFactoryMap.get(prefix);
	}
}
