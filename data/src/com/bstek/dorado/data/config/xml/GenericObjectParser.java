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

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.definition.ObjectDefinition;
import com.bstek.dorado.config.xml.ObjectParser;
import com.bstek.dorado.data.config.definition.ListenableObjectDefinition;

/**
 * 数据配置文件中各种对象的通用解析器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 18, 2008
 */
public class GenericObjectParser extends ObjectParser {
	private static final Log logger = LogFactory
			.getLog(GenericObjectParser.class);

	protected DataObjectParseHelper dataObjectParseHelper;

	public GenericObjectParser() {
		try {
			this.setDefinitionType(ListenableObjectDefinition.class);
		} catch (ClassNotFoundException e) {
			logger.error(e, e);
		}
	}

	public void setDataObjectParseHelper(
			DataObjectParseHelper dataObjectParseHelper) {
		this.dataObjectParseHelper = dataObjectParseHelper;
	}

	@Override
	protected Object doParse(Node node, ParseContext context) throws Exception {
		DataParseContext dataContext = (DataParseContext) context;
		String privateNameSection = dataContext.getPrivateNameSection(node);
		if (privateNameSection != null) {
			dataContext.setPrivateObjectNameSection(privateNameSection);
		}

		Object object = internalParse(node, dataContext);

		if (privateNameSection != null) {
			dataContext.restorePrivateObjectName();
		}
		return object;
	}

	@Override
	protected void initDefinition(ObjectDefinition definition, Element element,
			ParseContext context) throws Exception {
		super.initDefinition(definition, element, context);

		if (definition instanceof ListenableObjectDefinition) {
			String listener = (String) definition
					.removeProperty(DataXmlConstants.ATTRIBUTE_LISTENER);
			if (StringUtils.isNotEmpty(listener)) {
				((ListenableObjectDefinition) definition).setListener(listener);
			}
		}
	}
}
