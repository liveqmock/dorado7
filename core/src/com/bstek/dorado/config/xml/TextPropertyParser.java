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

package com.bstek.dorado.config.xml;

import org.apache.commons.lang.StringUtils;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.text.TextParseContext;
import com.bstek.dorado.config.text.TextParser;
import com.bstek.dorado.core.el.Expression;
import com.bstek.dorado.core.el.ExpressionHandler;
import com.bstek.dorado.util.xml.DomUtils;

/**
 * 用于将某属性值的解析任务分派一个TextParser的特殊属性解析器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apr 2, 2008
 */
public class TextPropertyParser implements XmlParser {
	private TextParser textParser;
	private ExpressionHandler expressionHandler;

	/**
	 * 设置用于接管属性值的解析任务的子解析器。
	 */
	public void setTextParser(TextParser textParser) {
		this.textParser = textParser;
	}

	/**
	 * 返回用于接管属性值的解析任务的子解析器。
	 * 
	 * @return 用于接管属性值的解析任务的子解析器。
	 */
	public TextParser getTextParser() {
		return textParser;
	}

	/**
	 * 设置EL表达式的处理器。
	 */
	public void setExpressionHandler(ExpressionHandler expressionHandler) {
		this.expressionHandler = expressionHandler;
	}

	/**
	 * 返回EL表达式的处理器。
	 */
	public ExpressionHandler getExpressionHandler() {
		return expressionHandler;
	}

	public Object parse(Node node, ParseContext context) throws Exception {
		String nodeValue;
		if (node instanceof Element) {
			nodeValue = DomUtils.getTextContent((Element) node);
		} else {
			nodeValue = node.getNodeValue();
		}
		Expression expression = getExpressionHandler().compile(nodeValue);
		if (expression != null) {
			nodeValue = String.valueOf(expression.evaluate());
		}
		return parseText(nodeValue, context);
	}

	/**
	 * 解析传入的字符串并返回解析结果。
	 * 
	 * @throws Exception
	 */
	protected Object parseText(String text, ParseContext context)
			throws Exception {
		if (StringUtils.isNotEmpty(text)) {
			TextParseContext textParseContext = new TextParseContext();
			TextParser parser = getTextParser();
			if (parser != null) {
				return parser.parse(text.toCharArray(), textParseContext);
			}
		}
		return null;
	}

}
