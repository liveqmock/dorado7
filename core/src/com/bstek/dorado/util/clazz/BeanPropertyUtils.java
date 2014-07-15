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

import java.lang.reflect.Field;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-12-7
 */
public abstract class BeanPropertyUtils {

	public static boolean isValidProperty(Class<?> beanClass, String property) {
		// "callbacks" from net.sf.cglib.proxy.Factory
		// "handler" from javassist.util.proxy.ProxyObject
		// "hibernateLazyInitializer" from org.hibernate.proxy.LazyInitializer
		return (!"class".equals(property) && !"callbacks".equals(property)
				&& !"handler".equals(property) && !"hibernateLazyInitializer"
				.equals(property));
	}

	public static Object getFieldValue(Object bean, String property)
			throws Exception {
		Field field = bean.getClass().getDeclaredField(property);
		field.setAccessible(true);
		return field.get(bean);
	}

	public static void setFieldValue(Object bean, String property, Object value)
			throws Exception {
		Field field = bean.getClass().getDeclaredField(property);
		field.setAccessible(true);
		field.set(bean, value);
	}
}
