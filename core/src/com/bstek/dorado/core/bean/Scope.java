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

package com.bstek.dorado.core.bean;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-12-15
 */
public enum Scope {
	/**
	 * 瞬间的，即该实例只在瞬间有效，用完即被抛弃。
	 */
	instant,
	
	/**
	 * 对当前线程有效。
	 */
	thread,

	/**
	 * 单例的，即该实例一旦被创建将在整个JVM的运行周期内有效。
	 */
	singleton,

	/**
	 * Web会话范围的生命周期。
	 */
	session,

	/**
	 * Web请求范围的生命周期。
	 */
	request
}
