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

import org.w3c.dom.Element;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.definition.DefinitionReference;
import com.bstek.dorado.config.definition.ObjectDefinition;
import com.bstek.dorado.data.config.definition.DataProviderDefinition;

/**
 * EntityDataType中数据关联属性声明对象的解析器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apirl 22, 2007
 */
public class ReferenceParser extends PropertyDefParser {

	@Override
	protected void initDefinition(ObjectDefinition definition, Element element,
			ParseContext context) throws Exception {
		super.initDefinition(definition, element, context);

		DefinitionReference<DataProviderDefinition> dataProviderRef = dataObjectParseHelper
				.getReferencedDataProvider(
						DataXmlConstants.ATTRIBUTE_DATA_PROVIDER, element,
						(DataParseContext) context);
		if (dataProviderRef != null) {
			definition.setProperty(DataXmlConstants.ATTRIBUTE_DATA_PROVIDER,
					dataProviderRef);
		}
	}
}
