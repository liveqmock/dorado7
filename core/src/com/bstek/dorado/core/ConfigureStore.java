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

import java.util.List;
import java.util.Set;

import org.apache.commons.lang.BooleanUtils;

/**
 * 用于存贮配置信息的对象。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Sep 27, 2008
 */
public abstract class ConfigureStore {

	private List<ConfigureListener> listeners;

	public void addListener(ConfigureListener listener) {
		listeners.add(listener);
	}

	public void removeListener(ConfigureListener listener) {
		listeners.remove(listener);
	}

	protected void fireBeforeConfigureChange(String property, Object newValue) {
		if (listeners == null) {
			return;
		}
		for (ConfigureListener listener : listeners) {
			listener.beforeConfigureChange(property, newValue);
		}
	}

	protected void fireOnConfigureChange(String property) {
		if (listeners == null) {
			return;
		}
		for (ConfigureListener listener : listeners) {
			listener.onConfigureChange(property);
		}
	}

	/**
	 * 检查是否包含某项配置信息。
	 */
	public abstract boolean contains(String key);

	/**
	 * 根据给定的配置项的名称返回其值。
	 * 
	 * @param key 配置项的名称
	 */
	public abstract Object get(String key);

	/**
	 * 删除给定的配置项。
	 * 
	 * @param key 配置项的名称
	 */
	public abstract void remove(String key);

	/**
	 * 设置给定的配置项的值。
	 * 
	 * @param key 配置项的名称
	 * @param value 值。
	 */
	public final void set(String key, Object value) {
		fireBeforeConfigureChange(key, value);
		doSet(key, value);
		fireOnConfigureChange(key);
	}

	protected abstract void doSet(String key, Object value);

	/**
	 * 返回所有配置项名称的集合。
	 * 
	 * @return 所有配置项名称的集合。
	 */
	public abstract Set<String> keySet();

	/**
	 * 以String形式返回某配置项的值。
	 * 
	 * @param key
	 *            配置项的名称
	 */
	public String getString(String key) {
		Object value = get(key);
		return (value == null) ? null : value.toString();
	}

	/**
	 * 以String形式返回某配置项的值，如果该配置项不存在则返回给定的默认值。
	 * 
	 * @param key 配置项的名称
	 * @param defaultValue 默认值
	 */
	public String getString(String key, String defaultValue) {
		if (contains(key)) {
			return getString(key);
		} else {
			return defaultValue;
		}
	}

	/**
	 * 以boolean形式返回某配置项的值。
	 * 
	 * @param key
	 *            配置项的名称
	 */
	public boolean getBoolean(String key) {
		Object value = get(key);
		return (value instanceof Boolean) ? ((Boolean) value).booleanValue()
				: BooleanUtils.toBoolean((value == null) ? null : value
						.toString());
	}

	/**
	 * 以boolean形式返回某配置项的值，如果该配置项不存在则返回给定的默认值。
	 * 
	 * @param key 配置项的名称
	 * @param defaultValue 默认值
	 */
	public boolean getBoolean(String key, boolean defaultValue) {
		if (contains(key)) {
			return getBoolean(key);
		} else {
			return defaultValue;
		}
	}

	/**
	 * 以long形式返回某配置项的值。
	 * 
	 * @param key 配置项的名称
	 */
	public long getLong(String key) {
		Object value = get(key);
		return (value instanceof Number) ? ((Number) value).longValue() : Long
				.parseLong((value == null) ? null : value.toString());
	}

	/**
	 * 以long形式返回某配置项的值，如果该配置项不存在则返回给定的默认值。
	 * 
	 * @param key 配置项的名称
	 * @param defaultValue 默认值
	 */
	public long getLong(String key, long defaultValue) {
		if (contains(key)) {
			return getLong(key);
		} else {
			return defaultValue;
		}
	}
}
