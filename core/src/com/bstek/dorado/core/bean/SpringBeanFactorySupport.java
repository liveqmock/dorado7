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

import com.bstek.dorado.util.proxy.ProxyBeanUtils;

/**
 * 根据Spring中定义个Bean的名称获得相应的Bean实例的工厂抽象支持类。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Dec 27, 2007
 */
public abstract class SpringBeanFactorySupport implements BeanFactory {

	/**
	 * 返回Spring的Bean工厂。
	 * @throws Exception
	 */
	protected abstract org.springframework.beans.factory.BeanFactory getBeanFactory()
			throws Exception;

	public Object getBean(String beanName) throws Exception {
		return getBeanFactory().getBean(beanName);
	}

	public Object getBean(String beanName,
			MethodInterceptor[] methodInterceptors) throws Exception {
		Object bean = getBean(beanName);
		if (bean != null && methodInterceptors != null
				&& methodInterceptors.length > 0) {
			bean = ProxyBeanUtils.proxyBean(bean, methodInterceptors);
		}
		return bean;
	}
}
