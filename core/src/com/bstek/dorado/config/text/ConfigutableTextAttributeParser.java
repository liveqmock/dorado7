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
 * 可在Spring配置文件中方便的进行配置的字符串属性值的解析器。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apr 2, 2008
 */
public class ConfigutableTextAttributeParser extends TextAttributeParser {
	private ExpressionHandler expressionHandler;

	/**
	 * 设置EL表达式的处理器。
	 */
	public void setExpressionHandler(ExpressionHandler expressionHandler) {
		this.expressionHandler = expressionHandler;
	}

	/**
	 * 返回EL表达式的处理器。
	 */
	@Override
	protected ExpressionHandler getExpressionHandler() {
		return expressionHandler;
	}

}
