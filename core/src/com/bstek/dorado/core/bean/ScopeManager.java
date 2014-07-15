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

import java.util.HashMap;
import java.util.Hashtable;
import java.util.Map;

import com.bstek.dorado.core.Context;

/**
 * 对象作用范围（生命周期）的管理器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 26, 2008
 */
public class ScopeManager {
	private static final String CONTEXT_KEY = ScopeManager.class.getName()
			+ ".CONTEXT";
	private static Map<String, Object> singletonContext = new Hashtable<String, Object>();

	/**
	 * 根据对象的作用范围和键值从相应的上下文中获得对象实例，如果上下文尚不存在这样一个对象则返回null。
	 * 
	 * @param scope
	 *            对象的作用范围
	 * @param key
	 *            键值
	 * @return 对象实例
	 */
	public Object getBean(Scope scope, String key) {
		if (Scope.singleton.equals(scope)) {
			return singletonContext.get(key);
		} else if (Scope.thread.equals(scope)) {
			Context context = Context.getCurrent();

			@SuppressWarnings("unchecked")
			Map<String, Object> map = (Map<String, Object>) context
					.getAttribute(Context.THREAD, CONTEXT_KEY);

			return (map != null) ? map.get(key) : null;
		} else if (Scope.instant.equals(scope)) {
			return null;
		} else {
			throw new IllegalArgumentException("Unsupport scope [" + scope
					+ "].");
		}
	}

	/**
	 * 将给定的对象实例存入与其作用范围相应的上下文中。
	 * 
	 * @param scope
	 *            对象的作用范围
	 * @param key
	 *            键值
	 * @param bean
	 *            对象实例
	 */
	public void putBean(Scope scope, String key, Object bean) {
		if (Scope.singleton.equals(scope)) {
			singletonContext.put(key, bean);
		} else if (Scope.thread.equals(scope)) {
			Context context = Context.getCurrent();

			@SuppressWarnings("unchecked")
			Map<String, Object> map = (Map<String, Object>) context
					.getAttribute(Context.THREAD, CONTEXT_KEY);

			if (map == null) {
				map = new HashMap<String, Object>();
				context.setAttribute(Context.THREAD, CONTEXT_KEY, map);
			}
			map.put(key, bean);
		} else if (!Scope.instant.equals(scope)) {
			throw new IllegalArgumentException("Unsupport scope [" + scope
					+ "].");
		}
	}

	/**
	 * 从某作用范围相应的上下文中移除某个对象。
	 * 
	 * @param scope
	 *            对象的作用范围
	 * @param key
	 *            键值
	 * @return 被移除掉的对象实例
	 */
	public Object removeBean(Scope scope, String key) {
		if (Scope.singleton.equals(scope)) {
			return singletonContext.remove(key);
		} else if (Scope.thread.equals(scope)) {
			Context context = Context.getCurrent();

			@SuppressWarnings("unchecked")
			Map<String, Object> map = (Map<String, Object>) context
					.getAttribute(Context.THREAD, CONTEXT_KEY);

			return (map != null) ? map.remove(key) : null;
		} else if (Scope.instant.equals(scope)) {
			return null;
		} else {
			throw new IllegalArgumentException("Unsupport scope [" + scope
					+ "].");
		}
	}

	/**
	 * 清除某作用范围中所有的对象实例。
	 * 
	 * @param scope
	 *            对象的作用范围
	 */
	public void clear(Scope scope) {
		if (Scope.singleton.equals(scope)) {
			singletonContext.clear();
		} else if (Scope.singleton.equals(scope)) {
			Context context = Context.getCurrent();
			context.removeAttribute(Context.THREAD, CONTEXT_KEY);
		} else if (!Scope.instant.equals(scope)) {
			throw new IllegalArgumentException("Unsupport scope [" + scope
					+ "].");
		}
	}
}
