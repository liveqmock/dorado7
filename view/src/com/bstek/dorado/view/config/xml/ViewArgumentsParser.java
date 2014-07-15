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

package com.bstek.dorado.view.config.xml;

import java.util.HashMap;
import java.util.Map;

import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.xml.ConfigurableDispatchableXmlParser;
import com.bstek.dorado.config.xml.XmlConstants;
import com.bstek.dorado.util.xml.DomUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-7-8
 */
public class ViewArgumentsParser extends ConfigurableDispatchableXmlParser {

	@Override
	protected Object doParse(Node node, ParseContext context) throws Exception {
		Map<String, Object> arguments = new HashMap<String, Object>();
		for (Element element : DomUtils.getChildrenByTagName((Element) node,
				ViewXmlConstants.ARGUMENT)) {
			String name = element.getAttribute(XmlConstants.ATTRIBUTE_NAME);
			Map<String, Object> properties = parseProperties(element, context);
			Object value = properties.get(XmlConstants.ATTRIBUTE_VALUE);
			arguments.put(name, value);
		}
		return arguments;
	}

}
