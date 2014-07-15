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

package com.bstek.dorado.core;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.core.io.ResourceLoader;

/**
 * Dorado的上下文对象。
 * <p>
 * 通过Context可以取到Dorado使用的各种核心服务类、基本的配置信息等。<br>
 * 并且Context是与当前线程相关的，在使用Context.getContext()获取Context的实例之前，
 * 应该首先将具体的Context实现类关联到ThreadLocal中。
 * </p>
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 19, 2007
 * @see java.lang.ThreadLocal
 * @see com.bstek.dorado.core.io.Resource
 * @see com.bstek.dorado.core.io.ResourceLoader
 */
public abstract class Context implements ResourceLoader {

	/**
	 * 表示当前线程的范围。
	 */
	public static final String THREAD = "thread";

	/**
	 * 用于实现与当前线程绑定的ThreadLocal对象，在具体的Context实现类中应该将Context的实例注入到ThreadLocal中。
	 */
	private static ThreadLocal<Context> threadLocal = new ThreadLocal<Context>();

	private static Context failSafeContext;

	private Map<String, Object> attributes = new HashMap<String, Object>();

	/**
	 * 获得当前线程相关的Context实例。<br>
	 * 使用方法：
	 * 
	 * <pre>
	 * Context context = Context.getContext();
	 * </pre>
	 */
	public static Context getCurrent() {
		Context context = (threadLocal != null) ? threadLocal.get() : null;
		return (context != null) ? context : failSafeContext;
	}

	public static void setFailSafeContext(Context failSafeContext) {
		Context.failSafeContext = failSafeContext;
	}

	/**
	 * 将给定的Context对象与当前线程关联起来。
	 */
	protected static final void attachToThreadLocal(Context context) {
		threadLocal.set(context);
	}

	/**
	 * 断开给定的Context对象与当前线程之间的关联关系。
	 */
	protected static final Context dettachFromThreadLocal() {
		Context context = getCurrent();
		threadLocal.set(null);
		return context;
	}

	/**
	 * 获取某个核心服务类的实例。
	 * 
	 * @param name
	 *            服务名称
	 * @throws Exception
	 */
	public abstract Object getServiceBean(String name) throws Exception;

	/**
	 * 获取某个与当前上下文相关的属性值。
	 * 
	 * @param key
	 *            属性的键值
	 */
	public Object getAttribute(String key) {
		return getAttribute(THREAD, key);
	}

	/**
	 * 设置某个与当前上下文相关的属性值。
	 * 
	 * @param key
	 *            属性的键值
	 * @param value
	 *            属性值
	 */
	public void setAttribute(String key, Object value) {
		setAttribute(THREAD, key, value);
	}

	/**
	 * 删除某个与当前上下文相关的属性。
	 * 
	 * @param key
	 *            属性的键值
	 */
	public void removeAttribute(String key) {
		removeAttribute(THREAD, key);
	}

	private Object throwsInvalidScope(String scope)
			throws IllegalArgumentException {
		throw new IllegalArgumentException("Invalid scope [" + scope + "].");
	}

	/**
	 * 返回指定范围内某属性的值。
	 * 
	 * @param scope
	 *            范围。可使用的值包括{@link #THREAD}。 注意，在Context的具体实现类中可以支持更多的范围，例如
	 *            {@link com.bstek.dorado.web.DoradoContext#getAttribute}。
	 * @param key
	 *            属性名。
	 * @return 值。
	 */
	public Object getAttribute(String scope, String key) {
		if (THREAD.equals(scope)) {
			return attributes.get(key);
		} else {
			return throwsInvalidScope(scope);
		}
	}

	/**
	 * 删除指定范围内某属性。
	 * 
	 * @param scope
	 *            范围。可使用的值包括{@link #THREAD}。 注意，在Context的具体实现类中可以支持更多的范围，例如
	 *            {@link com.bstek.dorado.web.DoradoContext#getAttribute}。
	 * @param key
	 *            属性名。
	 */
	public void removeAttribute(String scope, String key) {
		if (THREAD.equals(scope)) {
			attributes.remove(key);
		} else {
			throwsInvalidScope(scope);
		}
	}

	/**
	 * 设置指定范围内某属性的值。
	 * 
	 * @param scope
	 *            范围。可使用的值包括{@link #THREAD}。 注意，在Context的具体实现类中可以支持更多的范围，例如
	 *            {@link com.bstek.dorado.web.DoradoContext#getAttribute}。
	 * @param key
	 *            属性名。
	 * @param value
	 *            值。
	 */
	public void setAttribute(String scope, String key, Object value) {
		if (THREAD.equals(scope)) {
			attributes.put(key, value);
		} else {
			throwsInvalidScope(scope);
		}
	}

	/**
	 * 根据资源路径获取相应的资源描述对象。
	 * 
	 * @param resourceLocation
	 *            资源路径
	 * @see com.bstek.dorado.core.io.Resource
	 * @see com.bstek.dorado.core.io.ResourceLoader
	 */
	public abstract Resource getResource(String resourceLocation);

	/**
	 * 根据资源路径获取相应的资源描述对象的数组。<br>
	 * 此处的资源路径可支持通配符，因此可以返回一个以上的资源描述对象。
	 * 
	 * @param locationPattern
	 *            资源路径（可支持通配符）
	 * @throws IOException
	 * @see com.bstek.dorado.core.io.Resource
	 * @see com.bstek.dorado.core.io.ResourceLoader
	 */
	public abstract Resource[] getResources(String locationPattern)
			throws IOException;

	/**
	 * 获取内部使用的{@link com.bstek.dorado.core.io.ResourceLoader}
	 * 在查找资源时使用的ClassLoader。
	 * 
	 * @see java.lang.ClassLoader
	 */
	public abstract ClassLoader getClassLoader();

}
