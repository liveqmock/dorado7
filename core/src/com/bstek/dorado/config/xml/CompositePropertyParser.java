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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.bstek.dorado.config.ConfigUtils;
import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.definition.ObjectDefinition;
import com.bstek.dorado.config.text.TextParseContext;
import com.bstek.dorado.config.text.TextParser;
import com.bstek.dorado.core.el.Expression;
import com.bstek.dorado.util.xml.DomUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-4-4
 */
public class CompositePropertyParser extends ObjectParser {
	private TextParser textParser;
	private PropertyParser defaultPropertyParser;
	private boolean open;

	@Override
	public void setScopable(boolean scopable) {
		throw new UnsupportedOperationException();
	}

	@Override
	public void setInheritable(boolean inheritable) {
		throw new UnsupportedOperationException();
	}

	public void setTextParser(TextParser textParser) {
		this.textParser = textParser;
	}

	public void setDefaultPropertyParser(PropertyParser defaultPropertyParser) {
		this.defaultPropertyParser = defaultPropertyParser;
	}

	public boolean isOpen() {
		return open;
	}

	public void setOpen(boolean open) {
		this.open = open;
	}

	protected TextParser getTextParser(ParseContext context) {
		return textParser;
	}

	@Override
	protected XmlParser findPropertyParser(String constraint) {
		XmlParser parser = super.findPropertyParser(constraint);
		if (parser == null && open) {
			parser = defaultPropertyParser;
		}
		return parser;
	}

	protected Map<String, Object> parseSubProperties(
			List<Element> childElements, ParseContext context) throws Exception {
		Map<String, Object> properties = new HashMap<String, Object>();
		for (Element propertyElement : childElements) {
			String name = propertyElement
					.getAttribute(XmlConstants.ATTRIBUTE_NAME);
			if (StringUtils.isEmpty(name)) {
				continue;
			}
			Object value = parseProperty(name, propertyElement, context);
			if (value != ConfigUtils.IGNORE_VALUE) {
				properties.put(name, value);
			}
		}
		return properties;
	}

	protected void initDefinition(ObjectDefinition definition,
			Map<String, Object> properties) throws ClassNotFoundException {
		definition.setImpl(getImpl());
		definition.setProperties(properties);
	}

	@Override
	@SuppressWarnings("unchecked")
	protected Object doParse(Node node, ParseContext context) throws Exception {
		String text = null;
		Map<String, Object> properties = null;
		if (node instanceof Element) {
			Element element = (Element) node;
			if (element.getChildNodes().getLength() == 0) {
				text = element.getAttribute(XmlConstants.ATTRIBUTE_VALUE);
			} else {
				List<Element> childElements = DomUtils.getChildrenByTagName(
						element, XmlConstants.PROPERTY);
				if (!childElements.isEmpty()) {
					properties = parseSubProperties(childElements, context);
				}
			}
		} else {
			text = node.getNodeValue();
		}

		if (textParser != null && StringUtils.isNotEmpty(text)) {
			Expression expression = getExpressionHandler().compile(text);
			if (expression != null) {
				text = String.valueOf(expression.evaluate());
			}

			if (StringUtils.isNotEmpty(text)) {
				TextParseContext textParseContext = new TextParseContext();
				properties = (Map<String, Object>) textParser.parse(
						text.toCharArray(), textParseContext);
			}
		}

		if (properties != null) {
			ObjectDefinition definition = getDefinitionType().newInstance();
			initDefinition(definition, properties);
			return definition;
		} else {
			return (textParser != null) ? null : text;
		}
	}
}
