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

package com.bstek.dorado.view.widget.data;

import org.w3c.dom.Element;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.definition.DefinitionReference;
import com.bstek.dorado.config.definition.ObjectDefinition;
import com.bstek.dorado.data.config.definition.DataProviderDefinition;
import com.bstek.dorado.data.config.definition.DataTypeDefinition;
import com.bstek.dorado.data.config.xml.DataXmlConstants;
import com.bstek.dorado.view.config.definition.DataSetDefinition;
import com.bstek.dorado.view.config.xml.ViewParseContext;
import com.bstek.dorado.view.widget.ComponentParser;

/**
 * 数据集的解析器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jan 20, 2008
 */
public class DataSetParser extends ComponentParser {

	@Override
	protected void initDefinition(ObjectDefinition definition, Element element,
			ParseContext context) throws Exception {
		super.initDefinition(definition, element, context);

		ViewParseContext viewContext = (ViewParseContext) context;
		DataSetDefinition dataSet = (DataSetDefinition) definition;
		DefinitionReference<DataProviderDefinition> dataProviderRef = dataObjectParseHelper
				.getReferencedDataProvider(
						DataXmlConstants.ATTRIBUTE_DATA_PROVIDER, element,
						viewContext);
		if (dataProviderRef != null) {
			dataSet.setDataProvider(dataProviderRef);
		}

		DefinitionReference<DataTypeDefinition> dataTypeRef = dataObjectParseHelper
				.getReferencedDataType(DataXmlConstants.ATTRIBUTE_DATA_TYPE,
						element, viewContext);
		if (dataTypeRef != null) {
			dataSet.setDataType(dataTypeRef);
		}
	}
}
