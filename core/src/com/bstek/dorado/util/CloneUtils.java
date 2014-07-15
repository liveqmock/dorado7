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

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * 用于辅助实现对象克隆的工具类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Dec 30, 2007
 */
public abstract class CloneUtils {
	private static final String CLONE_METHOD = "clone";
	private static final Class<?>[] CLONE_METHOD_ARGTYPES = new Class<?>[] {};
	private static final Object[] CLONE_METHOD_ARGS = new Object[] {};

	/**
	 * 克隆对象。
	 * 
	 * @param object
	 *            被克隆的对象
	 * @return 克隆的对象
	 * @throws CloneNotSupportedException
	 */
	@SuppressWarnings("unchecked")
	public static <T> T clone(T object) throws CloneNotSupportedException {
		T clonedObject = null;
		Class<?> cl = object.getClass();
		Method method = null;
		try {
			do {
				try {
					method = cl.getDeclaredMethod(CLONE_METHOD,
							CLONE_METHOD_ARGTYPES);
				} catch (NoSuchMethodException e) {
					cl = cl.getSuperclass();
				}
			} while (method == null);

			if (method != null) {
				boolean methodAccessible = method.isAccessible();
				if (!methodAccessible)
					method.setAccessible(true);
				try {
					clonedObject = (T) method.invoke(object, CLONE_METHOD_ARGS);
				} finally {
					if (!methodAccessible)
						method.setAccessible(false);
				}
			}
		} catch (SecurityException e) {
			e.printStackTrace();
		} catch (InvocationTargetException e) {
			e.getCause().printStackTrace();
		} catch (IllegalArgumentException e) {
			e.printStackTrace();
		} catch (IllegalAccessException e) {
			e.printStackTrace();
		}
		return clonedObject;
	}

}
