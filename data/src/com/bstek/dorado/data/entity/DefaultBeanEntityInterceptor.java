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

package com.bstek.dorado.data.entity;

import java.lang.reflect.Method;

import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;

import com.bstek.dorado.data.type.EntityDataType;
import com.bstek.dorado.util.proxy.ChainedMethodInvocation;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-12-19
 */
public class DefaultBeanEntityInterceptor extends BeanEntityEnhancer implements
		MethodInterceptor {

	public DefaultBeanEntityInterceptor(EntityDataType dataType, Class<?> beanType)
			throws Exception {
		super(dataType, beanType);
	}

	public Object invoke(MethodInvocation methodInvocation) throws Throwable {
		Object result = interceptor(methodInvocation);
		if (result == UNDISPOSED_VALUE) {
			result = methodInvocation.proceed();
		}
		return result;
	}

	public Object interceptor(MethodInvocation methodInvocation)
			throws Throwable {
		Object result = UNDISPOSED_VALUE;
		Method method = methodInvocation.getMethod();
		String property = readMethods.get(method);
		if (property != null) { // read
			result = interceptReadMethod(
					(ChainedMethodInvocation) methodInvocation, property);
		} else {
			property = writeMethods.get(method);
			if (property != null) { // write
				if (!interceptWriteMethod(
						(ChainedMethodInvocation) methodInvocation, property)) {
					result = null;
				}
			}
		}
		return result;
	}

	protected Object interceptReadMethod(
			ChainedMethodInvocation methodInvocation, String property)
			throws Throwable {
		return interceptReadMethod(methodInvocation.getProxy(), property,
				methodInvocation.proceed(), false);
	}

	protected boolean interceptWriteMethod(
			ChainedMethodInvocation methodInvocation, String property)
			throws Throwable {
		return interceptWriteMethod(methodInvocation.getProxy(), property,
				methodInvocation.getArguments()[0], false);
	}

	@Override
	public Class<?> getPropertyType(Object entity, String property) {
		return super.getPropertyType(getBeanMap(entity), property);
	}
}
