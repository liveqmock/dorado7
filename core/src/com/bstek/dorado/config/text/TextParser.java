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

import com.bstek.dorado.config.Parser;

/**
 * 字符串解析器的通用接口。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 28, 2008
 * @see com.bstek.dorado.config.ParseContext
 */
public interface TextParser extends Parser {
	/**
	 * 解析给定的字符串，并返回解析结果。
	 * @param charArray 要解析的字符串
	 * @param context 解析的上下文对象
	 * @return 解析结果
	 * @throws Exception
	 */
	Object parse(char[] charArray, TextParseContext context) throws Exception;
}
