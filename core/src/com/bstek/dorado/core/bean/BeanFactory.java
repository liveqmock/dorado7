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

import org.aopalliance.intercept.MethodInterceptor;

/**
 * 根据一段Bean的描述信息获得相应的Bean实例的工厂接口。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Dec 26, 2007
 */
public interface BeanFactory {

	String getBeanNamePrefix();

	/**
	 * 根据给定的Bean的描述信息创建相应的Bean实例。
	 * @param beanName Bean的描述信息
	 * @return 相应的Bean实例
	 * @throws Exception
	 */
	Object getBean(String beanName) throws Exception;

	/**
	 * 根据给定的Bean的描述信息创建相应的Bean实例。
	 * @param beanName Bean的描述信息
	 * @param methodInterceptors 将要绑定在Bean实例上的方法拦截器
	 * @return 相应的Bean实例
	 * @throws Exception
	 */
	Object getBean(String beanName, MethodInterceptor[] methodInterceptors)
			throws Exception;
}
