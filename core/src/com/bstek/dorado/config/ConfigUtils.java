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

package com.bstek.dorado.config;

import com.bstek.dorado.util.Counter;

/**
 * 与配置文件加载操作相关的工具类。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 3, 2008
 */
public class ConfigUtils {
	private static ThreadLocal<Counter> threadLocal = new ThreadLocal<Counter>();

	/**
	 * 用于表示该结果在实际运行时将被忽略（抛弃）的特殊结果值。
	 * @see com.bstek.dorado.config.xml.NonPropertyParser
	 */
	public static final Object IGNORE_VALUE = new Object();

	/**
	 * 设置当前线程是否正处于解析配置文件并建立对象模型的处理过程中。
	 * <p>
	 * 注意：该操作的内部使用了一个与线程相关的计数器来管理状态，这意味着如果我们连续执行了n次
	 * <code>ConfigUtils.setDuringBuildTemplate(true);</code>方法， 那么也就必须再执行n次
	 * <code>ConfigUtils.setDuringBuildTemplate(false);</code>方法，才能重新将
	 * <code>ConfigUtils.isDuringBuildTemplate();</code>的状态重置回false。
	 * </p>
	 */
	public static void setDuringBuildTemplate(boolean duringBuildTemplate) {
		Counter counter = threadLocal.get();
		if (counter == null && duringBuildTemplate) {
			counter = new Counter();
			threadLocal.set(counter);
		}

		if (duringBuildTemplate) {
			counter.increase();
		}
		else if (counter != null) {
			counter.decrease();
			if (counter.getValue() <= 0) {
				threadLocal.set(null);
			}
		}
	}

	/**
	 * 判断当前线程是否正处于解析配置文件并建立对象模型的处理过程中。
	 * @see #setDuringBuildTemplate(boolean)
	 */
	public static boolean isDuringBuildTemplate() {
		return (threadLocal.get() != null);
	}
}
