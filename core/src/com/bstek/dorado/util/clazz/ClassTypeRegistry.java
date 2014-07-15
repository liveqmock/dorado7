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

package com.bstek.dorado.util.clazz;

import java.util.HashMap;
import java.util.Map;

/**
 * 实现利用反射从给定的一组Class类型中寻找最匹配者功能的集合类。<br>
 * 为了提高执行效率，此集合类会缓存每次进行匹配运算后得到的结果。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apr 10, 2008
 */
public class ClassTypeRegistry<T> {
	private static class AnonymousClass extends Object {
	};

	private final static Class<?> NULL_CLASS = AnonymousClass.class;
	private final static Object NULL_OBJECT = new Object();

	private Map<Class<?>, T> typeMap = new HashMap<Class<?>, T>();
	private Map<Class<?>, Class<?>> typeMatchingCache = new HashMap<Class<?>, Class<?>>();
	private Map<Class<?>, T> valueMatchingCache = new HashMap<Class<?>, T>();

	private void clearCache() {
		typeMatchingCache.clear();
		valueMatchingCache.clear();
	}

	/**
	 * 向集合中注册一种Class类型及与该类型关联的数据。
	 * 
	 * @param type
	 *            要注册的Class类型
	 * @param value
	 *            与类型关联的数据
	 */
	public void registerType(Class<?> type, T value) {
		typeMap.put(type, value);
		clearCache();
	}

	/**
	 * 从集合中注销一种Class类型。
	 * 
	 * @param type
	 *            要注销的Class类型
	 */
	public void unregisterType(Class<?> type) {
		typeMap.remove(type);
		clearCache();
	}

	/**
	 * 根据给定的Class类型从已注册Class类型中的寻找最为匹配的类型。
	 * 
	 * @param type
	 *            给定的Class类型
	 * @return 最匹配的Class类型
	 */
	public Class<?> getMatchingType(Class<?> type) {
		Class<?> matchingType = typeMatchingCache.get(type);
		if (matchingType == null) {
			for (Class<?> tmpType : typeMap.keySet()) {
				if (tmpType.isAssignableFrom(type)) {
					if (matchingType == null) {
						matchingType = tmpType;
					} else {
						if (matchingType.isAssignableFrom(tmpType)) {
							matchingType = tmpType;
						}
					}
				}
			}

			typeMatchingCache.put(type, (matchingType == null) ? NULL_CLASS
					: matchingType);
		}

		if (matchingType == NULL_CLASS) {
			matchingType = null;
		}
		return matchingType;
	}

	/**
	 * 根据给定的Class类型从已注册Class类型中的寻找最为匹配的数据。
	 * 
	 * @param type
	 *            给定的Class类型
	 * @return 最匹配的数据
	 */
	@SuppressWarnings("unchecked")
	public T getMatchingValue(Class<?> type) {
		T matchingValue = valueMatchingCache.get(type);
		if (matchingValue == null) {
			Class<?> matchingType = getMatchingType(type);
			if (matchingType != null) {
				matchingValue = typeMap.get(matchingType);
			}
			valueMatchingCache.put(type,
					(matchingValue == null) ? (T) NULL_OBJECT : matchingValue);
		}

		if (matchingValue == NULL_OBJECT) {
			matchingValue = null;
		}
		return matchingValue;
	}

	/**
	 * 清除集合中所有已注册的信息。
	 */
	public void clear() {
		typeMap.clear();
		clearCache();
	}

}
