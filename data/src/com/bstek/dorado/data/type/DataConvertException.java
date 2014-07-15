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

package com.bstek.dorado.data.type;

/**
 * 数据转换异常。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 7, 2007
 */
public class DataConvertException extends IllegalArgumentException {
	private static final long serialVersionUID = -5373897721016500878L;

	/**
	 * @param sourceType
	 *            源数据类型。
	 * @param targetType
	 *            目标数据类型。
	 */
	public DataConvertException(Class<?> sourceType, Class<?> targetType) {
		super("Can not convert value from [" + sourceType + "] to ["
				+ targetType + "]");
	}

	/**
	 * @param sourceType
	 *            源数据类型。
	 * @param targetType
	 *            目标数据类型。
	 * @param throwable
	 */
	public DataConvertException(Class<?> sourceType, Class<?> targetType,
			Throwable throwable) {
		super("Can not convert value from [" + sourceType + "] to ["
				+ targetType + "]", throwable);
	}

	/**
	 * @param value
	 *            正在转换的数据。
	 * @param targetType
	 *            目标数据类型。
	 */
	public DataConvertException(Object value, Class<?> targetType) {
		super("Can not convert value [" + value + "] to [" + targetType + "]");
	}

	/**
	 * @param value
	 *            正在转换的数据。
	 * @param targetType
	 *            目标数据类型。
	 * @param throwable
	 */
	public DataConvertException(Object value, Class<?> targetType,
			Throwable throwable) {
		super("Can not convert value [" + value + "] to [" + targetType + "]",
				throwable);
	}
}
