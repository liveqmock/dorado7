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
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import javassist.util.proxy.MethodHandler;
import javassist.util.proxy.ProxyFactory;
import javassist.util.proxy.ProxyObject;

import org.aopalliance.intercept.MethodInterceptor;

import com.bstek.dorado.util.clazz.ClassUtils;

/**
 * 用于辅助创建动态代理的工具类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Dec 28, 2007
 */
public abstract class ProxyBeanUtils {
	public static final int JAVASSIST = 0;
	public static final int CGLIB = 1;

	private static int defaultByteCodeProvider = JAVASSIST;
	private static final Class<?>[] SERIALIZABLE_INTERFACES = new Class[] { SerializationReplaceable.class };

	private static boolean extraEnhancersInited;
	private static Method springCglibIsEnhancerMethod;

	// private static Map<Class<?>, Class<?>> javassistProxyClassCache = new
	// Hashtable<Class<?>, Class<?>>();
	// private static Map<Class<?>, Enhancer> cglibEnhancerCache = new
	// Hashtable<Class<?>, Enhancer>();

	public static int getDefaultByteCodeProvider() {
		return defaultByteCodeProvider;
	}

	public static void setDefaultByteCodeProvider(int defaultByteCodeProvider) {
		ProxyBeanUtils.defaultByteCodeProvider = defaultByteCodeProvider;
	}

	/**
	 * 向一个方法拦截器数组中追加一个拦截器。
	 * 
	 * @param originMethodInterceptors
	 *            原方法拦截器数组
	 * @param methodInterceptor
	 *            要追加的方法拦截器
	 * @return 新的方法拦截器数组
	 */
	public static MethodInterceptor[] appendMethodInterceptor(
			MethodInterceptor[] originMethodInterceptors,
			MethodInterceptor methodInterceptor) {
		MethodInterceptor[] newMethodInterceptors;
		if (originMethodInterceptors == null) {
			newMethodInterceptors = new MethodInterceptor[] { methodInterceptor };
		} else {
			newMethodInterceptors = new MethodInterceptor[originMethodInterceptors.length + 1];
			System.arraycopy(originMethodInterceptors, 0,
					newMethodInterceptors, 0, originMethodInterceptors.length);
			newMethodInterceptors[originMethodInterceptors.length] = methodInterceptor;
		}
		return newMethodInterceptors;
	}

	/**
	 * 向一个方法拦截器数组中追加一组拦截器。
	 * 
	 * @param originMethodInterceptors
	 *            原方法拦截器数组
	 * @param methodInterceptors
	 *            要追加的方法拦截器的数组
	 * @return 新的方法拦截器数组
	 */
	public static MethodInterceptor[] appendMethodInterceptors(
			MethodInterceptor[] originMethodInterceptors,
			MethodInterceptor[] methodInterceptors) {
		MethodInterceptor[] newMethodInterceptors = null;
		if (originMethodInterceptors == null) {
			newMethodInterceptors = methodInterceptors;
		} else if (methodInterceptors == null) {
			newMethodInterceptors = originMethodInterceptors;
		} else {
			newMethodInterceptors = new MethodInterceptor[originMethodInterceptors.length
					+ methodInterceptors.length];
			System.arraycopy(originMethodInterceptors, 0,
					newMethodInterceptors, 0, originMethodInterceptors.length);
			System.arraycopy(methodInterceptors, 0, newMethodInterceptors,
					originMethodInterceptors.length, methodInterceptors.length);
		}
		return newMethodInterceptors;
	}

	/**
	 * 根据给定的Class类型（可以是Interface）创建Bean。
	 * 
	 * @throws Exception
	 */
	public static Object createBean(Class<?> cl) throws Exception {
		return createBean(cl, (MethodInterceptor) null);
	}

	/**
	 * 根据给定的Class类型和一个方法拦截器创建动态代理。
	 * <p>
	 * 如果没有指定任何方法拦截器，则会直接创建一个Bean。
	 * </p>
	 * 
	 * @throws Exception
	 */
	public static Object createBean(Class<?> cl,
			MethodInterceptor methodInterceptor) throws Exception {
		return createBean(cl, new MethodInterceptor[] { methodInterceptor });
	}

	/**
	 * 根据给定的Class类型和一组方法拦截器创建动态代理。
	 * <p>
	 * 如果没有指定任何方法拦截器，则会直接创建一个Bean。
	 * </p>
	 * 
	 * @throws Exception
	 */
	public static Object createBean(Class<?> cl,
			MethodInterceptor[] methodInterceptors) throws Exception {
		return createBean(cl, methodInterceptors, null, null);
	}

	/**
	 * 根据给定的Class类型、一组方法拦截器、以及构造参数信息创建动态代理。
	 * 
	 * @throws Exception
	 */
	public static Object createBean(Class<?> cl,
			MethodInterceptor[] methodInterceptors, Class<?>[] argTypes,
			Object[] args) throws Exception {
		Object proxyBean;
		if (methodInterceptors != null && methodInterceptors.length > 0) {
			BaseMethodInterceptorDispatcher mipd = new BaseMethodInterceptorDispatcher(
					methodInterceptors);
			if (defaultByteCodeProvider == JAVASSIST) {
				ProxyFactory proxyFactory = new ProxyFactory();
				proxyFactory.setUseCache(true);
				proxyFactory.setSuperclass(cl);
				if (Serializable.class.isAssignableFrom(cl)) {
					proxyFactory.setInterfaces(SERIALIZABLE_INTERFACES);
				}

				Class<?> proxyCl = proxyFactory.createClass();
				if (argTypes == null || argTypes.length == 0) {
					proxyBean = proxyCl.newInstance();
				} else {
					Constructor<?> constr = proxyCl.getConstructor(argTypes);
					if (constr == null) {
						throw new NoSuchMethodException(
								"Can not found a suitable constructor for ["
										+ proxyCl + "].");
					}
					proxyBean = constr.newInstance(args);
				}
				((ProxyObject) proxyBean).setHandler(mipd);
			} else {
				net.sf.cglib.proxy.Enhancer enhancer = new net.sf.cglib.proxy.Enhancer();
				enhancer.setSuperclass(cl);
				if (Serializable.class.isAssignableFrom(cl)) {
					enhancer.setInterfaces(SERIALIZABLE_INTERFACES);
				}
				enhancer.setCallback(mipd);
				if (argTypes == null || argTypes.length == 0) {
					proxyBean = enhancer.create();
				} else {
					proxyBean = enhancer.create(argTypes, args);
				}
			}
		} else {
			if (argTypes == null || argTypes.length == 0) {
				proxyBean = cl.newInstance();
			} else {
				Constructor<?> constr = cl.getConstructor(argTypes);
				if (constr == null) {
					throw new NoSuchMethodException(
							"Can not found a suitable constructor for [" + cl
									+ "].");
				}
				proxyBean = constr.newInstance(args);
			}
		}
		return proxyBean;
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static boolean isProxy(Class<?> cl) {
		boolean b = net.sf.cglib.proxy.Enhancer.isEnhanced(cl)
				|| ProxyFactory.isProxyClass(cl);
		if (!b) {
			if (!extraEnhancersInited) {
				extraEnhancersInited = true;
				try {
					Class enhancerType = ClassUtils
							.forName("org.springframework.cglib.proxy.Enhancer");
					springCglibIsEnhancerMethod = enhancerType.getMethod(
							"isEnhanced", new Class[] { Class.class });
				} catch (Exception e) {
					// do nothing
				}
			}

			if (springCglibIsEnhancerMethod != null) {
				try {
					b = (Boolean) springCglibIsEnhancerMethod.invoke(null,
							new Object[] { cl });
				} catch (Exception e) {
					// do nothing
				}
			}
		}
		return b;
	}

	public static boolean isProxy(Object bean) {
		if (bean == null) {
			return false;
		}

		boolean b = (bean instanceof ProxyObject || bean instanceof net.sf.cglib.proxy.Factory);
		if (!b) {
			b = isProxy(bean.getClass());
		}
		return b;
	}

	public static Class<?> getProxyTargetType(Object bean) {
		Class<?> cl = bean.getClass();
		while (ProxyBeanUtils.isProxy(cl)) {
			cl = cl.getSuperclass();
		}
		return cl;
	}

	public static Class<?> getProxyTargetType(Class<?> cl) {
		while (ProxyBeanUtils.isProxy(cl)) {
			cl = cl.getSuperclass();
		}
		return cl;
	}

	public static Object getProxyTarget(Object bean) throws Exception {
		Object target = bean;
		MethodInterceptorDispatcher methodInterceptorDispatcher = ProxyBeanUtils
				.getMethodInterceptorDispatcher(bean);
		if (methodInterceptorDispatcher != null
				&& methodInterceptorDispatcher instanceof MethodInterceptorProxyDispatcher) {
			target = ((MethodInterceptorProxyDispatcher) methodInterceptorDispatcher)
					.getTarget();
		}
		return target;
	}

	/**
	 * 根据给定的被代理对象和一个方法拦截器创建动态代理。
	 * 
	 * @throws Exception
	 */
	public static Object proxyBean(Object target,
			MethodInterceptor methodInterceptor) throws Exception {
		return proxyBean(target, new MethodInterceptor[] { methodInterceptor });
	}

	/**
	 * 根据给定的被代理对象和一组方法拦截器创建动态代理。
	 * 
	 * @throws Exception
	 */
	public static Object proxyBean(Object target,
			MethodInterceptor[] methodInterceptors) throws Exception {
		Class<?> cl = target.getClass();
		if (isProxy(cl)) {
			cl = cl.getSuperclass();
		}
		return proxyBean(target, cl, methodInterceptors, null, null);
	}

	/**
	 * 根据给定的被代理对象和一组方法拦截器创建动态代理。
	 * 
	 * @throws Exception
	 */
	public static Object proxyBean(Object target, Class<?> cl,
			MethodInterceptor[] methodInterceptors, Class<?>[] argTypes,
			Object[] args) throws Exception {
		MethodInterceptorProxyDispatcher mipd = new MethodInterceptorProxyDispatcher(
				target, methodInterceptors);

		boolean useJavassist;
		if (target instanceof ProxyObject) {
			useJavassist = true;
		} else if (target instanceof net.sf.cglib.proxy.Factory) {
			useJavassist = false;
		} else {
			useJavassist = (defaultByteCodeProvider == JAVASSIST);
		}

		if (useJavassist) {
			return proxyBeanWithJavassist(target, cl, argTypes, args, mipd);
		} else {
			return proxyBeanWithCglib(target, cl, argTypes, args, mipd);
		}
	}

	private static Object proxyBeanWithJavassist(Object target, Class<?> cl,
			Class<?>[] argTypes, Object[] args,
			MethodInterceptorProxyDispatcher mipd)
			throws NoSuchMethodException, InstantiationException,
			IllegalAccessException, InvocationTargetException {
		Class<?> proxyCl;
		if (target instanceof ProxyObject) {
			proxyCl = target.getClass();
		} else {
			// proxyCl = javassistProxyClassCache.get(cl);
			// if (proxyCl == null) {
			ProxyFactory proxyFactory = new ProxyFactory();
			proxyFactory.setUseCache(true);
			proxyFactory.setSuperclass(cl);
			if (target instanceof Serializable) {
				proxyFactory.setInterfaces(SERIALIZABLE_INTERFACES);
			}
			proxyCl = proxyFactory.createClass();
			// javassistProxyClassCache.put(cl, proxyCl);
			// }
		}

		Object proxyBean;
		if (argTypes == null || argTypes.length == 0) {
			proxyBean = proxyCl.newInstance();
		} else {
			proxyBean = proxyCl.getConstructor(argTypes).newInstance(args);
		}
		((ProxyObject) proxyBean).setHandler(mipd);
		return proxyBean;
	}

	private static Object proxyBeanWithCglib(Object target, Class<?> cl,
			Class<?>[] argTypes, Object[] args,
			MethodInterceptorProxyDispatcher mipd) {
		// net.sf.cglib.proxy.Enhancer enhancer = cglibEnhancerCache.get(cl);
		// if (enhancer == null) {
		net.sf.cglib.proxy.Enhancer enhancer = new net.sf.cglib.proxy.Enhancer();
		enhancer.setUseCache(true);
		enhancer.setSuperclass(cl);
		if (target instanceof Serializable) {
			enhancer.setInterfaces(SERIALIZABLE_INTERFACES);
		}
		// cglibEnhancerCache.put(cl, enhancer);
		// }
		enhancer.setCallback(mipd);
		if (argTypes == null || argTypes.length == 0) {
			return enhancer.create();
		} else {
			return enhancer.create(argTypes, args);
		}
	}

	/**
	 * @param object
	 * @return
	 * @throws Exception
	 */
	public static MethodInterceptorDispatcher getMethodInterceptorDispatcher(
			Object object) {
		MethodInterceptorDispatcher dispatcher = null;
		if (isProxy(object)) {
			if (object instanceof ProxyObject) {
				MethodHandler handler = ((ProxyObject) object).getHandler();
				if (handler instanceof MethodInterceptorDispatcher) {
					dispatcher = (MethodInterceptorDispatcher) handler;
				}
			} else if (object instanceof net.sf.cglib.proxy.Factory) {
				net.sf.cglib.proxy.Callback[] callbacks = ((net.sf.cglib.proxy.Factory) object)
						.getCallbacks();

				net.sf.cglib.proxy.Callback callback = callbacks[0];
				if (callback instanceof MethodInterceptorDispatcher) {
					dispatcher = (MethodInterceptorDispatcher) callback;
				} else {
					for (int i = 0; i < callbacks.length; i++) {
						callback = callbacks[i];
						if (callback instanceof MethodInterceptorDispatcher) {
							dispatcher = (MethodInterceptorDispatcher) callback;
							break;
						}
					}
				}
			}
		}
		return dispatcher;
	}
}
