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

package com.bstek.dorado.util;

import java.util.Collection;
import java.util.Map;

import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.lang.StringUtils;

/**
 * 增强的[断言]功能的工具类。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 14, 2007
 */
public abstract class Assert  {
	private Assert() {}

	/**
	 * 断言给定的expression的值为true，如果断言不准确则根据message参数抛出异常。
	 * @param expression 断言参数
	 * @param message 断言不准确时抛出的异常信息
	 */
	public static void isTrue(boolean expression, String message) {
		if (!expression) {
			throw new IllegalArgumentException(message);
		}
	}

	/**
	 * 断言给定的expression的值为true，如果断言不准确则抛出默认的异常。
	 * @param expression 断言参数
	 */
	public static void isTrue(boolean expression) {
		isTrue(expression, "[Assertion failed] - this expression must be true");
	}

	/**
	 * 断言给定的对象的值为null，如果断言不准确则根据message参数抛出异常。
	 * @param object 断言对象
	 * @param message 断言不准确时抛出的异常信息
	 */
	public static void isNull(Object object, String message) {
		if (object != null) {
			throw new IllegalArgumentException(message);
		}
	}

	/**
	 * 断言给定的对象的值为null，如果断言不准确则抛出默认的异常。
	 * @param object 断言对象
	 */
	public static void isNull(Object object) {
		isNull(object, "[Assertion failed] - the object argument must be null");
	}

	/**
	 * 断言给定的对象的值不是null，如果断言不准确则根据message参数抛出异常。
	 * @param object 断言对象
	 * @param message 断言不准确时抛出的异常信息
	 */
	public static void notNull(Object object, String message) {
		if (object == null) {
			throw new IllegalArgumentException(message);
		}
	}

	/**
	 * 断言给定的对象的值不是null，如果断言不准确则抛出默认的异常。
	 * @param object 断言对象
	 */
	public static void notNull(Object object) {
		notNull(object,
				"[Assertion failed] - this argument is required; it must not null");
	}

	/**
	 * 断言给定的字符串非空，如果断言不准确则根据message参数抛出异常。<br>
	 * 字符串非空是指字符串的不为null并且其长度大于0。
	 * @param text 断言字符串
	 * @param message 断言不准确时抛出的异常信息
	 */
	public static void notEmpty(String text, String message) {
		if (!StringUtils.isNotEmpty(text)) {
			throw new IllegalArgumentException(message);
		}
	}

	/**
	 * 断言给定的字符串非空，如果断言不准确则抛出默认的异常。<br>
	 * 字符串非空是指字符串的不为null并且其长度大于0。
	 * @param text 断言字符串
	 */
	public static void notEmpty(String text) {
		notEmpty(
				text,
				"[Assertion failed] - this String argument must have length; it must not be null or empty");
	}

	/**
	 * 断言给定的字符串中包含另一个子字符串，如果断言不准确则根据message参数抛出异常。
	 * @param textToSearch 被搜索的字符串
	 * @param substring 子字符串
	 * @param message 断言不准确时抛出的异常信息
	 */
	public static void doesNotContain(String textToSearch, String substring,
			String message) {
		if (StringUtils.isNotEmpty(textToSearch)
				&& StringUtils.isNotEmpty(substring)
				&& textToSearch.indexOf(substring) != -1) {
			throw new IllegalArgumentException(message);
		}
	}

	/**
	 * 断言给定的字符串中包含另一个子字符串，如果断言不准确则抛出默认的异常。
	 * @param textToSearch 被搜索的字符串
	 * @param substring 子字符串
	 */
	public static void doesNotContain(String textToSearch, String substring) {
		doesNotContain(textToSearch, substring,
				"[Assertion failed] - this String argument must not contain the substring ["
						+ substring + "]");
	}

	/**
	 * 断言给定的数组非空，如果断言不准确则根据message参数抛出异常。<br>
	 * 数组非空是指数组不为null并且其length大于0。
	 * @param array 断言数组
	 * @param message 断言不准确时抛出的异常信息
	 */
	public static void notEmpty(Object[] array, String message) {
		if (array == null || ArrayUtils.isEmpty(array)) {
			throw new IllegalArgumentException(message);
		}
	}

	/**
	 * 断言给定的数组非空，如果断言不准确则抛出默认的异常。<br>
	 * 数组非空是指数组不为null并且其length大于0。
	 * @param array 断言数组
	 */
	public static void notEmpty(Object[] array) {
		notEmpty(
				array,
				"[Assertion failed] - this array must not be empty: it must contain at least 1 element");
	}

	/**
	 * 断言给定的集合对象非空，如果断言不准确则根据message参数抛出异常。<br>
	 * 数组非空是指集合对象不为null并且其size大于0。
	 * @param collection 断言集合对象
	 * @param message 断言不准确时抛出的异常信息
	 */
	public static void notEmpty(Collection<?> collection, String message) {
		if (collection == null || collection.isEmpty()) {
			throw new IllegalArgumentException(message);
		}
	}

	/**
	 * 断言给定的集合对象非空，如果断言不准确则抛出默认的异常。<br>
	 * 数组非空是指集合对象不为null并且其size大于0。
	 * @param collection 断言集合对象
	 */
	public static void notEmpty(Collection<?> collection) {
		notEmpty(
				collection,
				"[Assertion failed] - this collection must not be empty: it must contain at least 1 element");
	}

	/**
	 * 断言给定的Map对象非空，如果断言不准确则根据message参数抛出异常。<br>
	 * 数组非空是指Map对象不为null并且其size大于0。
	 * @param map 断言Map对象
	 * @param message 断言不准确时抛出的异常信息
	 */
	public static void notEmpty(Map<?, ?> map, String message) {
		if (map == null || map.isEmpty()) {
			throw new IllegalArgumentException(message);
		}
	}

	/**
	 * 断言给定的Map对象非空，如果断言不准确则抛出默认的异常。<br>
	 * 数组非空是指Map对象不为null并且其size大于0。
	 * @param map 断言Map对象
	 */
	public static void notEmpty(Map<?, ?> map) {
		notEmpty(
				map,
				"[Assertion failed] - this map must not be empty; it must contain at least one entry");
	}

	/**
	 * 断言给定的对象是某Class类型的实例，如果断言不准确则根据message参数抛出异常。
	 * @param type Class类型
	 * @param obj 断言对象
	 * @param message 断言不准确时抛出的异常信息
	 */
	public static void isInstanceOf(Class<?> type, Object obj, String message) {
		notNull(type, "Type to check against must not be null");
		if (!type.isInstance(obj)) {
			throw new IllegalArgumentException(message + "Object of class ["
					+ (obj != null ? obj.getClass().getName() : "null")
					+ "] must be an instance of " + type);
		}
	}

	/**
	 * 断言给定的对象是某Class类型的实例，如果断言不准确则根据message参数抛出异常。
	 * @param type Class类型
	 * @param obj 断言对象
	 */
	public static void isInstanceOf(Class<?> type, Object obj) {
		isInstanceOf(type, obj, "");
	}

	/**
	 * 断言给定Class类型是另一个Class的子类型，如果断言不准确则根据message参数抛出异常。
	 * @param superType 断言的超类
	 * @param subType 断言的子类
	 * @param message 断言不准确时抛出的异常信息
	 */
	public static void isAssignable(Class<?> superType, Class<?> subType,
			String message) {
		notNull(superType, "Type to check against must not be null");
		if (subType == null || !superType.isAssignableFrom(subType)) {
			throw new IllegalArgumentException(message + subType
					+ " is not assignable to " + superType);
		}
	}

	/**
	 * 断言给定Class类型是另一个Class的子类型，如果断言不准确则根据message参数抛出异常。
	 * @param superType 断言的超类
	 * @param subType 断言的子类
	 */
	public static void isAssignable(Class<?> superType, Class<?> subType) {
		isAssignable(superType, subType, "");
	}
}
