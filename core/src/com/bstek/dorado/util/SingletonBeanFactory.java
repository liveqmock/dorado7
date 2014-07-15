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

import java.util.HashMap;
import java.util.Map;

import com.bstek.dorado.util.clazz.ClassUtils;

/**
 * 单例对象的创建工厂。
 * <p>
 * 单例工厂会记住每一创建过的实例，这样当单例工厂下一次被请求创建同样的对象时将直接返回上一次创建的相应实例。
 * 单例工厂就是通过这种方式确保每一个对象只被创建一次。
 * </p>
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 15, 2007
 */
public abstract class SingletonBeanFactory {
	private static Map<Class<?>, Object> instances = new HashMap<Class<?>, Object>();

	private SingletonBeanFactory() {}

	/**
	 * 获取某个Class类型的Singleton实例。
	 * @param className 例对象的Class类名
	 * @return 单例对象的实例
	 * @throws IllegalAccessException
	 * @throws InstantiationException
	 * @throws ClassNotFoundException
	 */
	public static Object getInstance(String className)
			throws IllegalAccessException, InstantiationException,
			ClassNotFoundException {
		Assert.notNull(className, "\"className\" is required");
		return getInstance(ClassUtils.forName(className));
	}

	/**
	 * 获取某个Class类型的Singleton实例。
	 * @param type 例对象的Class类型
	 * @return 单例对象的实例
	 * @throws IllegalAccessException
	 * @throws InstantiationException
	 */
	public static Object getInstance(Class<?> type)
			throws IllegalAccessException, InstantiationException {
		Assert.notNull(type, "\"type\" is required");
		synchronized (type) {
			Object instance = instances.get(type);
			if (instance == null) {
				instance = type.newInstance();
				instances.put(type, instance);
			}
			return instance;
		}
	}
}
