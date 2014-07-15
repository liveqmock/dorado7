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

package com.bstek.dorado.data.resolver;

import java.lang.reflect.Method;

import org.aopalliance.intercept.MethodInvocation;

import com.bstek.dorado.common.proxy.PatternMethodInterceptor;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-12-12
 */
public abstract class AbstractDataResolverMethodInterceptor extends
		PatternMethodInterceptor {
	public static final String METHOD_NAME = "resolve";

	public final Object invoke(MethodInvocation methodInvocation)
			throws Throwable {
		DataResolver dataResolver = (DataResolver) methodInvocation.getThis();
		Method method = methodInvocation.getMethod();
		String methodName = method.getName();

		if (method.getReturnType().equals(Object.class)
				&& methodName.equals(METHOD_NAME)) {
			Object[] arguments = methodInvocation.getArguments();
			DataItems dataItems = null;
			Object parameter = null;

			if (arguments.length == 1) {
				dataItems = (DataItems) arguments[0];
			} else if (arguments.length == 2) {
				dataItems = (DataItems) arguments[0];
				parameter = arguments[1];
			}

			return invokeResolve(methodInvocation, dataResolver, dataItems,
					parameter);
		}

		return methodInvocation.proceed();
	}

	protected abstract Object invokeResolve(MethodInvocation methodInvocation,
			DataResolver dataResolver, DataItems dataItems, Object parameter)
			throws Throwable;
}
