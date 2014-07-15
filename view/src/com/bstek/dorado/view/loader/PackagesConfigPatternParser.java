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

package com.bstek.dorado.view.loader;

import java.util.Map;

import org.apache.commons.beanutils.BeanMap;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.xml.ConfigurableDispatchableXmlParser;
import com.bstek.dorado.util.Assert;

/**
 * 资源样式的解析器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Sep 24, 2008
 */
public class PackagesConfigPatternParser extends
		ConfigurableDispatchableXmlParser {

	@Override
	@SuppressWarnings("unchecked")
	protected Object doParse(Node node, ParseContext context) throws Exception {
		Element element = (Element) node;
		String name = element.getAttribute("name");
		Assert.notEmpty(name);
		Pattern pattern = new Pattern(name);

		Map<String, Object> properties = parseProperties(element, context);
		((Map<String, Object>) new BeanMap(pattern)).putAll(properties);
		return pattern;
	}
}
