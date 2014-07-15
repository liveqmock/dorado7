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

import java.lang.reflect.AccessibleObject;
import java.lang.reflect.Method;

import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;

/**
 * 具有迭代激活下一个子拦截器功能的方法拦截对象。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Dec 28, 2007
 */
public class ChainedMethodInvocation implements MethodInvocation {
	private Object proxy;
	private Object object;
	private Method method;
	private Object[] arguments;
	private MethodInterceptorChain methodInterceptorChain;

	public ChainedMethodInvocation(Object proxy, Object object, Method method,
			Object[] arguments, MethodInterceptorChain methodInterceptorChain) {
		this.proxy = proxy;
		this.object = object;
		this.method = method;
		this.arguments = arguments;
		this.methodInterceptorChain = methodInterceptorChain;
	}

	public Object getProxy() {
		return proxy;
	}

	public Object getThis() {
		return object;
	}

	public Method getMethod() {
		return method;
	}

	public Object[] getArguments() {
		return arguments;
	}

	public AccessibleObject getStaticPart() {
		return null;
	}

	/**
	 * 返回用于迭代所有子方法拦截器的迭代器。
	 */
	public MethodInterceptor getNextMethodInterceptor() {
		return methodInterceptorChain.next(this);
	}

	public Object proceed() throws Throwable {
		MethodInterceptor methodInterceptor = getNextMethodInterceptor();
		if (methodInterceptor != null) {
			return methodInterceptor.invoke(this);
		} else {
			return null;
		}
	}
}
