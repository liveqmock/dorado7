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

import net.sf.cglib.proxy.MethodProxy;

import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;

/**
 * 可代理现成对象实例的方法拦截器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Dec 27, 2007
 */
public class MethodInterceptorProxyDispatcher extends
		MethodInterceptorDispatcher {
	private Object target;

	private static class FinalCglibMethodInterceptor implements
			MethodInterceptor {
		private MethodProxy methodProxy;

		public FinalCglibMethodInterceptor(MethodProxy methodProxy) {
			this.methodProxy = methodProxy;
		}

		public Object invoke(MethodInvocation methodInvocation)
				throws Throwable {
			return methodProxy.invoke(methodInvocation.getThis(),
					methodInvocation.getArguments());
		}
	}

	private static class FinalJavassistMethodInterceptor implements
			MethodInterceptor {
		private Method method;

		public FinalJavassistMethodInterceptor(Method method) {
			this.method = method;
		}

		public Object invoke(MethodInvocation methodInvocation)
				throws Throwable {
			return method.invoke(methodInvocation.getThis(),
					methodInvocation.getArguments());
		}
	}

	/**
	 * @param target
	 *            被代理的对象。
	 * @param subMethodInterceptors
	 *            等待分派的子方法拦截器的数组。
	 */
	public MethodInterceptorProxyDispatcher(Object target,
			MethodInterceptor[] subMethodInterceptors) {
		setSubMethodInterceptors(subMethodInterceptors);
		this.target = target;
	}

	@Override
	public MethodInterceptorFilter getMethodInterceptorFilter(Object object,
			Method method, Object[] args) {
		return null;
	}

	/**
	 * 返回被代理的对象。
	 */
	public Object getTarget() {
		return target;
	}

	@Override
	protected MethodInterceptor createCglibFinalMethodInterceptor(
			MethodProxy methodProxy) {
		return new FinalCglibMethodInterceptor(methodProxy);
	}

	@Override
	protected MethodInterceptor createJavassistFinalMethodInterceptor(
			Method method, Method procssed) {
		return new FinalJavassistMethodInterceptor(method);
	}

	@Override
	protected MethodInvocation createMethodInvocation(Object object,
			Method method, Object[] args,
			MethodInterceptorChain methodInterceptorChain) {
		return new ChainedMethodInvocation(object, target, method, args,
				methodInterceptorChain);
	}

}
