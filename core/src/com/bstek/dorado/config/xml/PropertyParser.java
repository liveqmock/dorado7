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

import org.w3c.dom.CharacterData;
import org.w3c.dom.Comment;
import org.w3c.dom.Element;
import org.w3c.dom.EntityReference;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.core.el.EvaluateMode;
import com.bstek.dorado.core.el.Expression;
import com.bstek.dorado.util.xml.DomUtils;

/**
 * 属性节点的解析器。<br>
 * 此处所指的属性包括XML节点中的属性(Attribute)以及下列形式的子属性节点：
 * <code><Property name="xxx">XXXX</Property></code>。 如果二者同时存在，则将以子属性节点中的定义为准。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apirl 18, 2007
 */
public class PropertyParser extends ConfigurableDispatchableXmlParser {

	protected Object getRealValue(Object value) {
		return (value instanceof Expression) ? ((Expression) value).evaluate()
				: value;
	}

	protected boolean shouldEvaluateExpression() {
		return false;
	}

	@Override
	protected Object doParse(Node node, ParseContext context) throws Exception {
		Object value = null;
		if (node instanceof Element) {
			Element element = (Element) node;
			NodeList childNodes = element.getChildNodes();
			int length = childNodes.getLength();
			boolean valueParsed = false;
			if (length == 0) {
				value = element.getAttribute(XmlConstants.ATTRIBUTE_VALUE);
				valueParsed = true;
			} else if (length == 1) {
				Node childNode = childNodes.item(0);
				if (((childNode instanceof CharacterData) && (!(childNode instanceof Comment)))
						|| (childNode instanceof EntityReference)) {
					value = childNode.getNodeValue();
					valueParsed = true;
				}
			}

			if (!valueParsed) {
				Element propertyElement = DomUtils.getChildByTagName(element,
						XmlConstants.PROPERTY);
				if (propertyElement != null
						&& XmlConstants.ATTRIBUTE_VALUE.equals(propertyElement
								.getAttribute(XmlConstants.ATTRIBUTE_NAME))) {
					value = DomUtils.getTextContent(propertyElement);
				} else {
					value = DomUtils.getTextContent(element);
				}
			}
		} else {
			value = node.getNodeValue();
		}

		if (value instanceof String) {
			Expression expression = getExpressionHandler().compile(
					(String) value);
			if (expression != null) {
				value = expression;
			}
		}

		if (value instanceof Expression) {
			Expression expression = (Expression) value;
			if (shouldEvaluateExpression()
					&& expression.getEvaluateMode().equals(
							EvaluateMode.onInstantiate)) {
				value = getRealValue(value);
			}
		}
		return value;
	}

}
