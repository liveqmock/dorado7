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

import java.util.Map;

import org.apache.commons.lang.BooleanUtils;
import org.apache.commons.lang.StringUtils;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.xml.ConfigurableDispatchableXmlParser;
import com.bstek.dorado.config.xml.XmlConstants;
import com.bstek.dorado.config.xml.XmlParseException;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apr 29, 2009
 */
public class PreloadDataResolverParser extends
		ConfigurableDispatchableXmlParser {

	@Override
	protected Object doParse(Node node, ParseContext context) throws Exception {
		DataParseContext dataContext = (DataParseContext) context;
		Element element = ((Element) node);

		String name = element.getAttribute(XmlConstants.ATTRIBUTE_NAME);
		if (StringUtils.isEmpty(name)) {
			throw new XmlParseException("[" + XmlConstants.ATTRIBUTE_NAME
					+ "] attribute of [" + DataXmlConstants.DATA_RESOLVER
					+ "] can not be empty - [" + dataContext.getResource()
					+ "]", element, context);
		}

		Map<String, NodeWrapper> configuredDataResolvers = dataContext
				.getConfiguredDataResolvers();
		if (configuredDataResolvers.containsKey(name)) {
			boolean overwrite = BooleanUtils.toBoolean(element
					.getAttribute(DataXmlConstants.ATTRIBUTE_OVERWRITE));
			if (!overwrite) {
				throw new XmlParseException(DataXmlConstants.DATA_RESOLVER
						+ " [" + name + "] is not unique!", element, context);
			}
		}

		configuredDataResolvers.put(name,
				new NodeWrapper(node, context.getResource()));
		return null;
	}

}
