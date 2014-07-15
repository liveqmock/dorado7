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

import java.util.Collection;
import java.util.Map;
import java.util.Set;

/**
 * {@link java.util.Map}代理的抽象支持类。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 28, 2007
 */
public abstract class MapProxySupport<K, V> implements Map<K, V> {
	/**
	 * target
	 */
	protected Map<K, V> target;

	/**
	 * @param target 被代理{@link java.util.Map}对象。
	 */
	public MapProxySupport(Map<K, V> target) {
		this.target = target;
	}

	/**
	 * 返回被代理的{@link java.util.Map}对象。
	 */
	public Map<K, V> getTarget() {
		return target;
	}

	public int size() {
		return target.size();
	}

	public boolean isEmpty() {
		return target.isEmpty();
	}

	public boolean containsKey(Object key) {
		return target.containsKey(key);
	}

	public boolean containsValue(Object value) {
		return target.containsValue(value);
	}

	public V get(Object key) {
		return target.get(key);
	}

	public V put(K key, V value) {
		return target.put(key, value);
	}

	public V remove(Object key) {
		return target.remove(key);
	}

	public void putAll(Map<? extends K, ? extends V> t) {
		target.putAll(t);
	}

	public void clear() {
		target.clear();
	}

	public Set<K> keySet() {
		return target.keySet();
	}

	public Collection<V> values() {
		return target.values();
	}

	public Set<Map.Entry<K, V>> entrySet() {
		return target.entrySet();
	}

	@Override
	public boolean equals(Object o) {
		return target.equals(o);
	}

	@Override
	public int hashCode() {
		return target.hashCode();
	}
}
