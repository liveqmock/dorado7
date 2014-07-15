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

package com.bstek.dorado.config.text;

/**
 * 字符串解析异常。
 * <p>
 * 用于封装字符串解析过程中产生的异常信息的异常对象。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apr 2, 2008
 */
public class TextParseException extends Exception {
	private static final long serialVersionUID = -2481140143796427069L;

	/**
	 * @param message 异常信息
	 */
	public TextParseException(String message) {
		super(message);
	}

	/**
	 * @param charArray 被解析的字符串
	 * @param context 解析上下文
	 */
	public TextParseException(char[] charArray, TextParseContext context) {
		super(populateErrorMessage("Syntax error.", charArray, context));
	}

	/**
	 * @param message 异常信息
	 * @param charArray 被解析的字符串
	 * @param context 解析上下文
	 */
	public TextParseException(String message, char[] charArray,
			TextParseContext context) {
		super(populateErrorMessage(message, charArray, context));
	}

	private static String populateErrorMessage(String message,
			char[] charArray, TextParseContext context) {
		StringBuffer buf = new StringBuffer(message);
		buf.append(" at char ");
		buf.append(context.getCurrentIndex() + 1);
		buf.append(" in [").append(charArray).append("].");
		return buf.toString();
	}
}
