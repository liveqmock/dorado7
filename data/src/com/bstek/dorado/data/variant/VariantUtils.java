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

import com.bstek.dorado.core.Configure;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.data.config.DataConfigManager;
import com.bstek.dorado.data.config.DataConfigManagerListener;
import com.bstek.dorado.util.SingletonBeanFactory;

/**
 * 用户辅助数据转换的工具类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 27, 2008
 */
public abstract class VariantUtils {
	private static VariantConvertor variantConvertor;

	/**
	 * 返回一个有效的数据转换器。
	 * 
	 * @throws Exception
	 */
	public static VariantConvertor getVariantConvertor() {
		if (variantConvertor == null) {
			try {
				String className = Configure.getString("data.variantConvertor");
				variantConvertor = (VariantConvertor) SingletonBeanFactory
						.getInstance(className);

				if (variantConvertor instanceof DataConfigManagerListener) {
					Context context = Context.getCurrent();
					DataConfigManager dataConfigManager = (DataConfigManager) context
							.getServiceBean("dataConfigManager");
					dataConfigManager
							.addConfigManagerListener((DataConfigManagerListener) variantConvertor);
				}
			} catch (Exception e) {
				throw new IllegalStateException(e);
			}
		}
		return variantConvertor;
	}

	/**
	 * 尝试将一个任何类型的对象转换成字符串。
	 */
	public static String toString(Object object) {
		return getVariantConvertor().toString(object);
	}

	/**
	 * 尝试将一个任何类型的对象转换成逻辑值。
	 */
	public static boolean toBoolean(Object object) {
		return getVariantConvertor().toBoolean(object);
	}

	/**
	 * 尝试将一个任何类型的对象转换成整数。
	 */
	public static int toInt(Object object) {
		return getVariantConvertor().toInt(object);
	}

	/**
	 * 尝试将一个任何类型的对象转换成长整数。
	 */
	public static long toLong(Object object) {
		return getVariantConvertor().toLong(object);
	}

	/**
	 * 尝试将一个任何类型的对象转换成浮点数。
	 */
	public static float toFloat(Object object) {
		return getVariantConvertor().toFloat(object);
	}

	/**
	 * 尝试将一个任何类型的对象转换成双精度浮点数。
	 */
	public static double toDouble(Object object) {
		return getVariantConvertor().toDouble(object);
	}

	/**
	 * 尝试将一个任何类型的对象转换成BigDecimal。
	 */
	public static BigDecimal toBigDecimal(Object object) {
		return getVariantConvertor().toBigDecimal(object);
	}

	/**
	 * 尝试将一个任何类型的对象转换成日期对象。
	 */
	public static Date toDate(Object object) {
		return getVariantConvertor().toDate(object);
	}
}
