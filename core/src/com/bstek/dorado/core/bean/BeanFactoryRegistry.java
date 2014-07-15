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

/**
 * Bean工厂的注册管理器接口。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Dec 26, 2007
 */
public interface BeanFactoryRegistry {

	/**
	 * 注册一种的Bean工厂。
	 * @param beanFactory 要注册的Bean工厂
	 */
	void registerBeanFactory(BeanFactory beanFactory);

	/**
	 * 根据Bean的描述信息返回相应的Bean工厂。
	 * @param beanName Bean的描述信息
	 * @return 相应的Bean工厂
	 */
	BeanFactory getBeanFactory(String beanName);

}
