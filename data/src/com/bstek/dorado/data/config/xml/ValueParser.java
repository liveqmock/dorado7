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

import org.w3c.dom.CharacterData;
import org.w3c.dom.Comment;
import org.w3c.dom.Element;
import org.w3c.dom.EntityReference;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.bstek.dorado.config.definition.DefinitionReference;
import com.bstek.dorado.data.config.definition.DataTypeDefinition;

/**
 * Value节点的解析器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apirl 20, 2007
 */
public class ValueParser extends DataElementParserSupport {

	protected String getTextValue(Element valueEle) {
		StringBuffer value = new StringBuffer();
		NodeList nl = valueEle.getChildNodes();
		int len = nl.getLength();
		for (int i = 0; i < len; ++i) {
			Node item = nl.item(i);
			if ((((!(item instanceof CharacterData)) || (item instanceof Comment)))
					&& (!(item instanceof EntityReference))) {
				continue;
			}
			value.append(item.getNodeValue());
		}
		return value.toString();
	}

	@Override
	protected Object internalParse(Node node, DataParseContext context)
			throws Exception {
		Element element = (Element) node;

		DefinitionReference<DataTypeDefinition> dataTypeRef = dataObjectParseHelper
				.getReferencedDataType(DataXmlConstants.ATTRIBUTE_DATA_TYPE,
						element, context);
		if (dataTypeRef == null) {
			dataTypeRef = context.getCurrentDataType();
		}
		context.setCurrentDataType(null);

		String valueText = getTextValue(element);
		Object value = parseValueFromText(valueText, context);

		context.restoreCurrentDataType();
		return value;
	}

}
