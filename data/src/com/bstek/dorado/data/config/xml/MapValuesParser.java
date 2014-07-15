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

package com.bstek.dorado.data.config.xml;

import org.apache.commons.lang.StringUtils;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.core.el.AbstractExpression;
import com.bstek.dorado.core.el.EvaluateMode;
import com.bstek.dorado.core.el.Expression;
import com.bstek.dorado.util.xml.DomUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2013-6-6
 */
public class MapValuesParser extends DataElementParser {
	@Override
	protected Object doParse(Node node, ParseContext context) throws Exception {
		String text;
		if (node instanceof Element) {
			text = DomUtils.getTextContent((Element) node);
		} else {
			text = node.getNodeValue();
		}

		if (StringUtils.isNotEmpty(text)) {
			Expression expression = getExpressionHandler().compile(text);
			if (expression != null) {
				if (expression.getEvaluateMode() == EvaluateMode.onInstantiate
						&& expression instanceof AbstractExpression) {
					((AbstractExpression) expression)
							.setEvaluateMode(EvaluateMode.onFirstRead);
				}
				return expression;
			}
		}

		return super.doParse(node, context);
	}
}
