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
 * Bean的包装器。主要用于通知外界被包装的Bean是否是一个全新的实例。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 13, 2008
 */
public class BeanWrapper {
	private Object bean;
	private boolean newInstance;

	/**
	 * @param bean 被包装的Bean
	 * @param newInstance 是否是一个全新的实例
	 */
	public BeanWrapper(Object bean, boolean newInstance) {
		this.bean = bean;
		this.newInstance = newInstance;
	}

	/**
	 * 返回被包装的Bean。
	 */
	public Object getBean() {
		return bean;
	}

	/**
	 * 返回是否是一个全新的实例。
	 */
	public boolean isNewInstance() {
		return newInstance;
	}
}
