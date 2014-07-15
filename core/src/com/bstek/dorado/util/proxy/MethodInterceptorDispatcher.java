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

import java.io.Serializable;
import java.lang.reflect.Method;

import javassist.util.proxy.MethodHandler;
import net.sf.cglib.proxy.MethodProxy;

import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;
import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * 抽象的方法拦截器的分发者。
 * <p>
 * 此类主要用于将一个基于net.sf.cglib.proxy.MethodInterceptor的方法拦截器中的调用
 * 分发到一个或一组org.aopalliance.intercept.MethodInterceptor方法拦截器中。
 * 使用此分发器即可以保证应用中定义的org.aopalliance.intercept.MethodInterceptor方法拦截器
 * 可以同时应用于Cglib和Spring AOP，又可以实现对方法的迭代拦截（即同时启用多个拦截器拦截被代理对象的同一个方法）。
 * </p>
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Dec 28, 2007
 */
public abstract class MethodInterceptorDispatcher implements MethodInterceptor,
		net.sf.cglib.proxy.MethodInterceptor, MethodHandler {
	private static final Log logger = LogFactory
			.getLog(MethodInterceptorDispatcher.class);

	private static final String WRITE_REPLACE = "writeReplace";
	private static Method EQUALS_METHOD;

	static {
		try {
			EQUALS_METHOD = Object.class.getDeclaredMethod("equals",
					new Class[] { Object.class });
		} catch (Exception e) {
			logger.warn(e, e);
		}
	}

	private static class FinalAopallianceMethodInterceptor implements
			MethodInterceptor {
		private MethodInvocation originMethodInvocation;

		public FinalAopallianceMethodInterceptor(
				MethodInvocation originMethodInvocation) {
			this.originMethodInvocation = originMethodInvocation;
		}

		public Object invoke(MethodInvocation methodInvocation)
				throws Throwable {
			return originMethodInvocation.proceed();
		}
	}

	private static class FinalCglibMethodInterceptor implements
			MethodInterceptor {
		private MethodProxy methodProxy;

		public FinalCglibMethodInterceptor(MethodProxy methodProxy) {
			this.methodProxy = methodProxy;
		}

		public Object invoke(MethodInvocation methodInvocation)
				throws Throwable {
			return methodProxy.invokeSuper(methodInvocation.getThis(),
					methodInvocation.getArguments());
		}
	}

	private static class FinalJavassistMethodInterceptor implements
			MethodInterceptor {
		private Method procssed;

		public FinalJavassistMethodInterceptor(Method procssed) {
			this.procssed = procssed;
		}

		public Object invoke(MethodInvocation methodInvocation)
				throws Throwable {
			return procssed.invoke(methodInvocation.getThis(),
					methodInvocation.getArguments());
		}
	}

	private MethodInterceptor[] subMethodInterceptors;

	/**
	 * 返回子方法拦截器的数组。
	 */
	public MethodInterceptor[] getSubMethodInterceptors() {
		return subMethodInterceptors;
	}

	public void setSubMethodInterceptors(
			MethodInterceptor[] subMethodInterceptors) {
		this.subMethodInterceptors = subMethodInterceptors;
	}

	public abstract MethodInterceptorFilter getMethodInterceptorFilter(
			Object object, Method method, Object[] args);

	/**
	 * 创建一个用于org.aopalliance.intercept.
	 * MethodInterceptor中invoke方法的MethodInvocation参数。
	 * 
	 * @param object
	 *            被代理对象
	 * @param method
	 *            被代理方法
	 * @param args
	 *            被代理方法的参数
	 * @param methodInterceptorChain
	 *            用于迭代所有子方法拦截器的迭代器（包含
	 *            {@link #createFinalMethodInterceptor(MethodProxy)}返回的拦截器）
	 */
	protected abstract MethodInvocation createMethodInvocation(Object object,
			Method method, Object[] args,
			MethodInterceptorChain methodInterceptorChain);

	protected MethodInterceptor createFinalAopallianceMethodInterceptor(
			MethodInvocation methodInvocation) {
		return new FinalAopallianceMethodInterceptor(methodInvocation);
	}

	protected MethodInterceptor createCglibFinalMethodInterceptor(
			MethodProxy methodProxy) {
		return new FinalCglibMethodInterceptor(methodProxy);
	}

	protected MethodInterceptor createJavassistFinalMethodInterceptor(
			Method method, Method procssed) {
		return new FinalJavassistMethodInterceptor(procssed);
	}

	protected boolean filterMethod(Method method) {
		return true;
	}

	public Object invoke(MethodInvocation methodInvocation) throws Throwable {
		Object object = methodInvocation.getThis();
		Method method = methodInvocation.getMethod();
		Object[] arguments = methodInvocation.getArguments();

		if (subMethodInterceptors != null && filterMethod(method)) {
			MethodInterceptorChain methodInterceptorChain = new MethodInterceptorChain(
					subMethodInterceptors,
					createFinalAopallianceMethodInterceptor(methodInvocation),
					getMethodInterceptorFilter(object, method, arguments));

			MethodInvocation mockMethodInvocation = createMethodInvocation(
					object, method, arguments, methodInterceptorChain);
			MethodInterceptor methodInterceptor = methodInterceptorChain
					.next(mockMethodInvocation);
			return methodInterceptor.invoke(mockMethodInvocation);
		} else {
			return methodInvocation.proceed();
		}
	}

	public Object intercept(Object object, Method method, Object[] args,
			MethodProxy methodProxy) throws Throwable {
		// 此处为提供针对equals()方法的特殊处理，因为dorado中并没有提供以AOP为基础的现有对象动态代理。
		if (method.equals(EQUALS_METHOD)) {
			Object proxyTarget = ProxyBeanUtils.getProxyTarget(args[0]);
			if (proxyTarget == object)
				return Boolean.TRUE;
			args = new Object[] { proxyTarget };
		}

		if (subMethodInterceptors != null && filterMethod(method)) {
			MethodInterceptorChain methodInterceptorChain = new MethodInterceptorChain(
					subMethodInterceptors,
					createCglibFinalMethodInterceptor(methodProxy),
					getMethodInterceptorFilter(object, method, args));

			MethodInvocation mockMethodInvocation = createMethodInvocation(
					object, method, args, methodInterceptorChain);
			MethodInterceptor methodInterceptor = methodInterceptorChain
					.next(mockMethodInvocation);
			return methodInterceptor.invoke(mockMethodInvocation);
		} else {
			return methodProxy.invokeSuper(object, args);
		}
	}

	protected Object getObjectForSerialization(Object object) throws Exception {
		Class<?> cl = ProxyBeanUtils.getProxyTargetType(object);
		if (cl != object.getClass()) {
			Object beanForSerialization = cl.newInstance();
			PropertyUtils.copyProperties(beanForSerialization, object);
			return beanForSerialization;
		} else {
			return object;
		}
	}

	public Object invoke(Object object, Method method, Method procssed,
			Object[] args) throws Throwable {
		if (method.equals(EQUALS_METHOD)) {
			Object proxyTarget = ProxyBeanUtils.getProxyTarget(args[0]);
			if (proxyTarget == object)
				return Boolean.TRUE;
			args = new Object[] { proxyTarget };
		} else if (object instanceof Serializable
				&& method.getName().equals(WRITE_REPLACE)
				&& method.getReturnType().equals(Object.class)) {
			try {
				Class<?> realClass = ProxyBeanUtils.getProxyTargetType(object);
				realClass.getMethod(WRITE_REPLACE, new Class<?>[0]);
			} catch (NoSuchMethodException e) {
				return getObjectForSerialization(object);
			}
		}

		if (subMethodInterceptors != null && filterMethod(method)) {
			MethodInterceptorChain methodInterceptorChain = new MethodInterceptorChain(
					subMethodInterceptors,
					createJavassistFinalMethodInterceptor(method, procssed),
					getMethodInterceptorFilter(object, method, args));

			MethodInvocation mockMethodInvocation = createMethodInvocation(
					object, method, args, methodInterceptorChain);
			MethodInterceptor methodInterceptor = methodInterceptorChain
					.next(mockMethodInvocation);
			return methodInterceptor.invoke(mockMethodInvocation);
		} else {
			return procssed.invoke(object, args);
		}
	}
}
