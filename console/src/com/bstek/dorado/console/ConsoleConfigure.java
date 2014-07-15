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

package com.bstek.dorado.console;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.Properties;

import org.apache.commons.lang.BooleanUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.util.Assert;

/**
 * 用于方便读取Dorado Console基础配置的工具类。
 * 
 * @author Alex Tong (mailto:alex.tong@bstek.com)
 * @since 2012-12-12
 */
public abstract class ConsoleConfigure {
	private static final String PROPERTIES_PATH = "com/bstek/dorado/console/configure.properties";
	private static final Log logger = LogFactory.getLog(ConsoleConfigure.class);
	@SuppressWarnings("rawtypes")
	private static Map map;
	static {
		Properties properties = new Properties();
		map = properties;
		InputStream in = ConsoleConfigure.class.getClassLoader()
				.getResourceAsStream(PROPERTIES_PATH);
		Assert.notNull(in, "Can not found resource \"" + PROPERTIES_PATH
				+ "\"!");
		try {
			properties.load(in);
		} catch (IOException e) {
			logger.error(e, e);
		}
	}

	public static Object get(String key) {
		return map.get(key);

	}

	/**
	 * 以String形式返回某配置项的值。
	 * 
	 * @param key
	 *            配置项的名称
	 */
	public static String getString(String key) {
		Object value = get(key);
		return (value == null) ? null : value.toString();
	}

	/**
	 * 以boolean形式返回某配置项的值。
	 * 
	 * @param key
	 *            配置项的名称
	 */
	public static boolean getBoolean(String key) {
		Object value = get(key);
		return (value instanceof Boolean) ? ((Boolean) value).booleanValue()
				: BooleanUtils.toBoolean((value == null) ? null : value
						.toString());
	}

	/**
	 * 以long形式返回某配置项的值。
	 * 
	 * @param key
	 *            配置项的名称
	 */
	public static long getLong(String key) {
		Object value = get(key);
		return (value instanceof Number) ? ((Number) value).longValue() : Long
				.parseLong((value == null) ? null : value.toString());
	}

}
