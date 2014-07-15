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
import com.bstek.dorado.config.xml.XmlParseException;
import com.bstek.dorado.config.xml.XmlParser;
import com.bstek.dorado.config.xml.XmlParserHelper;
import com.bstek.dorado.data.type.validator.ValidatorTypeRegisterInfo;
import com.bstek.dorado.data.type.validator.ValidatorTypeRegistry;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-7-27
 */
public class ValidatorParserDispatcher extends GenericParser {
	private XmlParserHelper xmlParserHelper;

	public void setXmlParserHelper(XmlParserHelper xmlParserHelper) {
		this.xmlParserHelper = xmlParserHelper;
	}

	private ValidatorTypeRegistry validatorTypeRegistry;

	public void setValidatorTypeRegistry(
			ValidatorTypeRegistry validatorTypeRegistry) {
		this.validatorTypeRegistry = validatorTypeRegistry;
	}

	protected boolean shouldProcessImport() {
		return false;
	}

	@Override
	protected Object doParse(Node node, ParseContext context) throws Exception {
		XmlParser parser = null;

		Element element = (Element) node;
		String type = element
				.getAttribute(DataXmlConstants.ATTRIBUTE_VALIDATOR_TYPE);
		ValidatorTypeRegisterInfo registryInfo = validatorTypeRegistry
				.getTypeRegisterInfo(type);
		if (registryInfo != null) {
			parser = xmlParserHelper.getXmlParser(registryInfo.getClassType());
		} else {
			throw new XmlParseException("Unrecognized Validator type[" + type
					+ "].", element, context);
		}
		if (parser == null) {
			throw new XmlParseException("Can not get Parser for Validator of ["
					+ type + "] type.", element, context);
		}
		return parser.parse(node, context);
	}

}
