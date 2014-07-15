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

package com.bstek.dorado.web;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.core.Configure;
import com.bstek.dorado.core.ConfigureStore;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.MapConfigureStore;

/**
 * 支持以Web特有的方式来读取Dorado基础配置的工具类。
 * <p>
 * 使用WebConfigure可以读取所有{@link com.bstek.dorado.core.Configure}中的配置项，
 * 同时WebConfigure提供给我们一种途径可以在某此请求中、某个会话中覆盖Dorado的基础配置。
 * </p>
 * <p>
 * 假设{@link com.bstek.dorado.core.Configure}有一个名为aaa.bbb.ccc的配置项，
 * 假设我们在当前会话中（即Session）中设置一个名为aaa
 * .bbb.ccc的属性，那么通过WebConfigure读到的将是会话中的属性值，而不是原先的Configure中的值。
 * WebConfigure总是按照下面的顺序来搜索配置
 * ，并返回第一个找到的值。Request->Session->ServletContext->Configure。
 * </p>
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Sep 28, 2008
 */
public abstract class WebConfigure {
	/**
	 * 用于代表null的特殊配置值。 当我们希望在Request或Session中将某个原有配置项的值覆盖为null时，
	 * 在Request或Session中设置一个同名的值为null的属性，并不能达到这一目的。 应该为该属性设置一个特殊的值用于代表null，即
	 * {@link #NULL}
	 */
	public static final Object NULL = new Object();

	final static String STORE_KEY = "localConfigure";

	public static final ConfigureStore EMPTY_STORE = new ConfigureStore() {
		@Override
		public boolean contains(String key) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Object get(String key) {
			throw new UnsupportedOperationException();
		}

		@Override
		public void remove(String key) {
			throw new UnsupportedOperationException();
		}

		@Override
		protected void doSet(String key, Object value) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Set<String> keySet() {
			throw new UnsupportedOperationException();
		}
	};

	private static ConfigureWrapper store = new ConfigureWrapper(
			Configure.getStore());

	/**
	 * 返回内部用于存贮配置信息的对象。
	 */
	public static ConfigureStore getStore() {
		return store;
	}

	@SuppressWarnings("unchecked")
	public static ConfigureStore getStore(String scope) {
		if (DoradoContext.APPLICATION.equals(scope)
				|| StringUtils.isEmpty(scope)) {
			return store;
		} else {
			DoradoContext context = DoradoContext.getCurrent();
			Map<String, Object> localConfigureMap = (Map<String, Object>) context
					.getAttribute(WebConfigure.STORE_KEY);
			return (localConfigureMap != null) ? new MapConfigureStore(
					localConfigureMap) : EMPTY_STORE;
		}
	}

	public static void set(String scope, String key, Object value) {
		store.set(scope, key, value);
	}

	public static void setNull(String scope, String key) {
		set(scope, key, NULL);
	}

	public static void remove(String scope, String key) {
		store.remove(scope, key);
	}

	/**
	 * 以String形式返回某配置项的值。
	 * 
	 * @param key
	 *            配置项的名称
	 */
	public static String getString(String key) {
		return store.getString(key);
	}

	/**
	 * 以String形式返回某配置项的值，如果该配置项不存在则返回给定的默认值。
	 * 
	 * @param key
	 *            配置项的名称
	 * @param defaultValue
	 *            默认值
	 */
	public static String getString(String key, String defaultValue) {
		return store.getString(key, defaultValue);
	}

	/**
	 * 以boolean形式返回某配置项的值。
	 * 
	 * @param key
	 *            配置项的名称
	 */
	public static boolean getBoolean(String key) {
		return store.getBoolean(key);
	}

	/**
	 * 以boolean形式返回某配置项的值，如果该配置项不存在则返回给定的默认值。
	 * 
	 * @param key
	 *            配置项的名称
	 * @param defaultValue
	 *            默认值
	 */
	public static boolean getBoolean(String key, boolean defaultValue) {
		return store.getBoolean(key, defaultValue);
	}

	/**
	 * 以long形式返回某配置项的值。
	 * 
	 * @param key
	 *            配置项的名称
	 */
	public static long getLong(String key) {
		return store.getLong(key);
	}

	/**
	 * 以long形式返回某配置项的值，如果该配置项不存在则返回给定的默认值。
	 * 
	 * @param key
	 *            配置项的名称
	 * @param defaultValue
	 *            默认值
	 */
	public static long getLong(String key, long defaultValue) {
		return store.getLong(key, defaultValue);
	}
}

class ConfigureWrapper extends ConfigureStore {
	private ConfigureStore store;

	public ConfigureWrapper(ConfigureStore store) {
		this.store = store;
	}

	@SuppressWarnings("unchecked")
	@Override
	public boolean contains(String key) {
		boolean b = store.contains(key);
		if (b)
			return true;

		Context context = Context.getCurrent();
		if (context instanceof DoradoContext) {
			DoradoContext doradoContext = (DoradoContext) context;
			Map<String, Object> localConfigureMap = (Map<String, Object>) doradoContext
					.getAttribute(DoradoContext.REQUEST, WebConfigure.STORE_KEY);
			if (localConfigureMap != null) {
				b = localConfigureMap.containsKey(key);
				if (b)
					return true;
			}

			localConfigureMap = (Map<String, Object>) doradoContext
					.getAttribute(DoradoContext.SESSION, WebConfigure.STORE_KEY);
			if (localConfigureMap != null) {
				b = localConfigureMap.containsKey(key);
				if (b)
					return true;
			}
		}

		return false;
	}

	@Override
	public void remove(String key) {
		throw new UnsupportedOperationException();
	}

	@SuppressWarnings("unchecked")
	public void remove(String scope, String key) {
		if (DoradoContext.APPLICATION.equals(scope)
				|| StringUtils.isEmpty(scope)) {
			store.remove(key);
		} else {
			DoradoContext context = DoradoContext.getCurrent();
			Map<String, Object> localConfigureMap = (Map<String, Object>) context
					.getAttribute(scope, WebConfigure.STORE_KEY);
			if (localConfigureMap == null) {
				localConfigureMap = new HashMap<String, Object>();
				context.setAttribute(scope, WebConfigure.STORE_KEY,
						localConfigureMap);
			}
			localConfigureMap.remove(key);
		}
	}

	@SuppressWarnings("unchecked")
	public void set(String scope, String key, Object value) {
		if (DoradoContext.APPLICATION.equals(scope)
				|| StringUtils.isEmpty(scope)) {
			doSet(key, value);
		} else {
			DoradoContext context = DoradoContext.getCurrent();
			Map<String, Object> localConfigureMap = (Map<String, Object>) context
					.getAttribute(scope, WebConfigure.STORE_KEY);
			if (localConfigureMap == null) {
				localConfigureMap = new HashMap<String, Object>();
				context.setAttribute(scope, WebConfigure.STORE_KEY,
						localConfigureMap);
			}
			localConfigureMap.put(key, value);
		}
	}

	@SuppressWarnings("unchecked")
	@Override
	public Object get(String key) {
		Context context = Context.getCurrent();

		if (context instanceof DoradoContext) {
			DoradoContext doradoContext = (DoradoContext) context;
			Map<String, Object> localConfigureMap = (Map<String, Object>) doradoContext
					.getAttribute(DoradoContext.REQUEST, WebConfigure.STORE_KEY);
			if (localConfigureMap != null) {
				Object value = localConfigureMap.get(key);
				if (value != null) {
					if (value == WebConfigure.NULL) {
						return null;
					} else {
						return value;
					}
				}
			}

			localConfigureMap = (Map<String, Object>) doradoContext
					.getAttribute(DoradoContext.SESSION, WebConfigure.STORE_KEY);
			if (localConfigureMap != null) {
				Object value = localConfigureMap.get(key);
				if (value != null) {
					if (value == WebConfigure.NULL) {
						return null;
					} else {
						return value;
					}
				}
			}
		}
		return store.get(key);
	}

	@Override
	protected void doSet(String key, Object value) {
		store.set(key, value);
	}

	@Override
	public Set<String> keySet() {
		return store.keySet();
	}
};
