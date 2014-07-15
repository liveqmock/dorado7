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

package com.bstek.dorado.console.jdbc.exception;

/**
 * 列数不正确异常定义类
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since 2012-12-24
 * 
 */
public class IncorrectColumnCountException extends Exception {

	private static final long serialVersionUID = -3414257137297791746L;

	public IncorrectColumnCountException() {
		super();
	}
}
