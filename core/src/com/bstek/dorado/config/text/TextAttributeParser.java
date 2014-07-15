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

import com.bstek.dorado.core.el.ExpressionHandler;

/**
 * 字符串中属性值的解析器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apr 2, 2008
 */
public abstract class TextAttributeParser implements TextParser {

	/**
	 * 返回EL表达式的处理器。
	 */
	protected abstract ExpressionHandler getExpressionHandler();

	/**
	 * 判断某字符是否一个应被忽略的字符。<br>
	 * 当解析属性值的内容时不会作此判断。
	 */
	protected boolean isIgnoredChar(char c) {
		return (c == ' ' || c == '\n' || c == '\r' || c == '\t');
	}

	public Object parse(char[] charArray, TextParseContext context)
			throws Exception {
		final int BEFORE_ATTRIBUTE_VALUE = 1;
		final int IN_ATTRIBUTE_VALUE = 2;
		final int AFTER_ATTRIBUTE_VALUE = 3;
		int status = BEFORE_ATTRIBUTE_VALUE;

		StringBuffer valueStack = new StringBuffer();
		for (int currentIndex = context.getCurrentIndex(); currentIndex < charArray.length
				&& status != AFTER_ATTRIBUTE_VALUE; currentIndex++) {
			char c = charArray[currentIndex];
			context.setCurrentIndex(currentIndex);

			switch (status) {
			case BEFORE_ATTRIBUTE_VALUE:
				if (isIgnoredChar(c)) {
					continue;
				} else if (c == ';') {
					status = AFTER_ATTRIBUTE_VALUE;
				} else {
					valueStack.append(c);
					status = IN_ATTRIBUTE_VALUE;
				}
				break;
			case IN_ATTRIBUTE_VALUE:
				if (c == ';') {
					status = AFTER_ATTRIBUTE_VALUE;
				} else {
					valueStack.append(c);
				}
				break;
			}
		}

		if (status != AFTER_ATTRIBUTE_VALUE) {
			context.increaseCurrentIndex();
		}

		Object result = "";
		if (valueStack.length() > 0) {
			String valueText = valueStack.toString();
			result = getExpressionHandler().compile(valueText);
			if (result == null) {
				result = valueText;
			}
		}
		return result;
	}
}
