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
import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.definition.CreationContext;
import com.bstek.dorado.config.definition.DefinitionInitOperation;
import com.bstek.dorado.config.definition.DefinitionReference;
import com.bstek.dorado.config.definition.ObjectDefinition;
import com.bstek.dorado.data.config.definition.DataTypeDefinition;
import com.bstek.dorado.data.config.definition.PropertyDefDefinition;

/**
 * EntityDataType中属性声明对象的解析器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 13, 2008
 */
public class PropertyDefParser extends GenericObjectParser {

	private static class AddPropertyDefOperation implements
			DefinitionInitOperation {
		private PropertyDefDefinition propertyDef;

		public AddPropertyDefOperation(PropertyDefDefinition propertyDef) {
			this.propertyDef = propertyDef;
		}

		public void execute(Object object, CreationContext context)
				throws Exception {
			DataTypeDefinition dataType = (DataTypeDefinition) object;
			dataType.addPropertyDef(propertyDef);
		}
	}

	@Override
	protected void initDefinition(ObjectDefinition definition, Element element,
			ParseContext context) throws Exception {
		DataParseContext dataContext = (DataParseContext) context;
		DefinitionReference<DataTypeDefinition> dataTypeRef = dataObjectParseHelper
				.getReferencedDataType(DataXmlConstants.ATTRIBUTE_DATA_TYPE,
						element, dataContext);
		if (dataTypeRef != null) {
			definition.setProperty(DataXmlConstants.ATTRIBUTE_DATA_TYPE,
					dataTypeRef);
		}
		super.initDefinition(definition, element, context);
	}

	@Override
	protected Object doParse(Node node, ParseContext context) throws Exception {
		PropertyDefDefinition definition = (PropertyDefDefinition) super
				.doParse(node, context);
		return new AddPropertyDefOperation(definition);
	}

}
