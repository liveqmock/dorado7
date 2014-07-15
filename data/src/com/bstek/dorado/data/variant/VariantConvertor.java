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

/**
 * 数据装换器。用于转换各种基本类型的数据。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jan 17, 2008
 */
public interface VariantConvertor {
	/**
	 * 尝试将一个任何类型的对象转换成字符串。
	 */
	String toString(Object object);

	/**
	 * 尝试将一个任何类型的对象转换成逻辑值。
	 */
	boolean toBoolean(Object object);

	/**
	 * 尝试将一个任何类型的对象转换成整数。
	 */
	int toInt(Object object);

	/**
	 * 尝试将一个任何类型的对象转换成长整数。
	 */
	long toLong(Object object);

	/**
	 * 尝试将一个任何类型的对象转换成浮点数。
	 */
	float toFloat(Object object);

	/**
	 * 尝试将一个任何类型的对象转换成双精度浮点数。
	 */
	double toDouble(Object object);

	/**
	 * 尝试将一个任何类型的对象转换成BigDecimal。
	 */
	BigDecimal toBigDecimal(Object object);

	/**
	 * 尝试将一个任何类型的对象转换成日期对象。
	 */
	Date toDate(Object object);

}
