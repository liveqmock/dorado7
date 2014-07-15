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

import java.lang.reflect.Modifier;
import java.util.HashMap;
import java.util.Map;

import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.bstek.dorado.config.definition.DefinitionReference;
import com.bstek.dorado.data.config.definition.DataTypeDefinition;
import com.bstek.dorado.data.config.definition.EntityDefinition;

/**
 * 实体数据的解析器。该解析器声明的解析结果为单个的Map或Bean。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 31, 2007
 */
public class EntityParser extends DataElementParserSupport {
	private static final Class<?> DEFAULT_MAP_TYPE = HashMap.class;

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

		Class<?> cl = null;
		if (dataTypeRef != null) {
			DataTypeDefinition dataTypeDefinition = dataTypeRef.getDefinition();
			cl = dataTypeDefinition.getCreationType();
			if (cl == null) {
				cl = dataTypeDefinition.getMatchType();
			}
		}
		if (cl != null) {
			if ((cl.getModifiers() & Modifier.ABSTRACT) == Modifier.ABSTRACT) {
				if (Map.class.isAssignableFrom(cl)) {
					cl = DEFAULT_MAP_TYPE;
				}
			}
		} else {
			cl = DEFAULT_MAP_TYPE;
		}

		EntityDefinition entityDefinition = new EntityDefinition();
		entityDefinition.setImplType(cl);
		entityDefinition.setProperties(parseProperties(element, context));

		context.restoreCurrentDataType();
		return entityDefinition;
	}
}
