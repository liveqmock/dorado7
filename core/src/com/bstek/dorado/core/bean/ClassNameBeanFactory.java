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

import com.bstek.dorado.util.clazz.ClassUtils;
import com.bstek.dorado.util.proxy.ProxyBeanUtils;

/**
 * 用于根据Bean的类名创建相应的Bean实例的工厂。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Dec 26, 2007
 */
public class ClassNameBeanFactory implements BeanFactory {
	private static final String PREFIX = "class";

	public String getBeanNamePrefix() {
		return PREFIX;
	}

	private Class<?> getBeanType(String beanName) throws ClassNotFoundException {
		Class<?> cl = ClassUtils.forName(beanName);
		if (cl == null) {
			throw new IllegalArgumentException("Can not resolve bean type ["
					+ beanName + "].");
		}
		return cl;
	}

	public Object getBean(String beanName) throws Exception {
		Class<?> cl = getBeanType(beanName);
		return cl.newInstance();
	}

	public Object getBean(String beanName,
			MethodInterceptor[] methodInterceptors) throws Exception {
		Object bean = null;
		if (methodInterceptors == null || methodInterceptors.length == 0) {
			bean = getBean(beanName);
		}
		else {
			bean = ProxyBeanUtils.createBean(getBeanType(beanName),
					methodInterceptors);
		}
		return bean;
	}
}
