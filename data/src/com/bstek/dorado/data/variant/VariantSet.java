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

package com.bstek.dorado.data.variant;

import java.math.BigDecimal;
import java.util.Date;
import java.util.Map;
import java.util.Set;

/**
 * 富类型变量的键值对集合。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apirl 20, 2007
 */
public interface VariantSet {
	/**
	 * 以字符串形式返回集合中的一个富类型变量。
	 * 
	 * @param key
	 *            要返回的数值所对应的键值。
	 * @return 字符串形式的值。
	 */
	String getString(String key);

	/**
	 * 以字符串形式设置集合中的一个富类型变量。
	 * 
	 * @param key
	 *            要设置的数值所对应的键值。
	 * @param s
	 *            字符串形式的值。
	 */
	void setString(String key, String s);

	/**
	 * 以逻辑值形式返回集合中的一个富类型变量。
	 * 
	 * @param key
	 *            要返回的数值所对应的键值。
	 * @return 逻辑值形式的值。
	 */
	boolean getBoolean(String key);

	/**
	 * 以逻辑值形式设置集合中的一个富类型变量。
	 * 
	 * @param key
	 *            要设置的数值所对应的键值。
	 * @param b
	 *            逻辑值形式的值。
	 */
	void setBoolean(String key, boolean b);

	/**
	 * 以整数形式返回集合中的一个富类型变量。
	 * 
	 * @param key
	 *            要返回的数值所对应的键值。
	 * @return 整数形式的值。
	 */
	int getInt(String key);

	/**
	 * 以整数形式设置集合中的一个富类型变量。
	 * 
	 * @param key
	 *            要设置的数值所对应的键值。
	 * @param i
	 *            整数形式的值。
	 */
	void setInt(String key, int i);

	/**
	 * 以长整数形式返回集合中的一个富类型变量。
	 * 
	 * @param key
	 *            要返回的数值所对应的键值。
	 * @return 长整数形式的值。
	 */
	long getLong(String key);

	/**
	 * 以长整数形式设置集合中的一个富类型变量。
	 * 
	 * @param key
	 *            要设置的数值所对应的键值。
	 * @param l
	 *            长整数形式的值。
	 */
	void setLong(String key, long l);

	/**
	 * 以浮点数形式返回集合中的一个富类型变量。
	 * 
	 * @param key
	 *            要返回的数值所对应的键值。
	 * @return 浮点数形式的值。
	 */
	float getFloat(String key);

	/**
	 * 以浮点数形式设置集合中的一个富类型变量。
	 * 
	 * @param key
	 *            要设置的数值所对应的键值。
	 * @param f
	 *            浮点数形式的值。
	 */
	void setFloat(String key, float f);

	/**
	 * 以双精度浮点数形式返回集合中的一个富类型变量。
	 * 
	 * @param key
	 *            要返回的数值所对应的键值。
	 * @return 双精度浮点数形式的值。
	 */
	double getDouble(String key);

	/**
	 * 以双精度浮点数形式设置集合中的一个富类型变量。
	 * 
	 * @param key
	 *            要设置的数值所对应的键值。
	 * @param d
	 *            双精度浮点数形式的值。
	 */
	void setDouble(String key, double d);

	/**
	 * 以BigDecimal形式返回集合中的一个富类型变量。
	 * 
	 * @param key
	 *            要返回的数值所对应的键值。
	 * @return BigDecimal形式的值。
	 */
	BigDecimal getBigDecimal(String key);

	/**
	 * 以BigDecimal形式设置集合中的一个富类型变量。
	 * 
	 * @param key
	 *            要设置的数值所对应的键值。
	 * @param bd
	 *            BigDecimal形式的值。
	 */
	void setBigDecimal(String key, BigDecimal bd);

	/**
	 * 以日期对象形式返回集合中的一个富类型变量。
	 * 
	 * @param key
	 *            要返回的数值所对应的键值。
	 * @return 日期对象形式的值。
	 */
	Date getDate(String key);

	/**
	 * 以日期对象形式设置集合中的一个富类型变量。
	 * 
	 * @param key
	 *            要设置的数值所对应的键值。
	 * @param date
	 *            日期对象形式的值。
	 */
	void setDate(String key, Date date);

	/**
	 * 不进行任何转换直接设置集合中的一个变量。
	 * 
	 * @param key
	 *            要返回的数值所对应的键值。
	 * @return 任意类型的数值。
	 */
	Object get(String key);

	/**
	 * 不进行任何转换直接返回集合中的一个变量。
	 * 
	 * @param key
	 *            要设置的数值所对应的键值。
	 * @param value
	 *            任意类型的数值。
	 */
	void set(String key, Object value);

	/**
	 * 返回所有键值的集合。
	 */
	Set<String> keySet();

	/**
	 * 以Map的形式返回集合中所有的键值和数据。
	 */
	Map<String, Object> toMap();

}
