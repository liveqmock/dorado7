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

import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;

/**
 * 不做任何实际处理的空属性解析器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jan 25, 2008
 */
public class UnsupportParser implements XmlParser {

	public Object parse(Node node, ParseContext context) throws Exception {
		String propertyName;
		if (node instanceof Element) {
			propertyName = ((Element) node)
					.getAttribute(XmlConstants.ATTRIBUTE_NAME);
		} else {
			propertyName = node.getNodeName();
		}
		throw new XmlParseException("Property \"" + propertyName
				+ "\" Unsupported.", node, context);
	}
}
