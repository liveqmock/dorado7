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
 * 支持作用范围定义的对象的通用接口。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 29, 2008
 */
public interface Scopable {
	/**
	 * 设置作用范围。
	 */
	void setScope(Scope scope);
}
