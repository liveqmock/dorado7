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

package com.bstek.dorado.util.proxy;

import java.lang.reflect.Method;

import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;

/**
 * 默认的方法拦截器的分发者。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Dec 28, 2007
 */
public class BaseMethodInterceptorDispatcher extends
		MethodInterceptorDispatcher {
	public BaseMethodInterceptorDispatcher(
			MethodInterceptor subMethodInterceptor) {
		this(new MethodInterceptor[] { subMethodInterceptor });
	}

	public BaseMethodInterceptorDispatcher(
			MethodInterceptor[] subMethodInterceptors) {
		setSubMethodInterceptors(subMethodInterceptors);
	}

	@Override
	public MethodInterceptorFilter getMethodInterceptorFilter(Object object,
			Method method, Object[] args) {
		return null;
	}

	@Override
	protected MethodInvocation createMethodInvocation(Object object,
			Method method, Object[] args,
			MethodInterceptorChain methodInterceptorChain) {
		return new ChainedMethodInvocation(object, object, method, args,
				methodInterceptorChain);
	}

}
