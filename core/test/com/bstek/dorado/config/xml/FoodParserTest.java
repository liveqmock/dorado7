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

package com.bstek.dorado.config.xml;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.definition.CreationContext;
import com.bstek.dorado.config.definition.ObjectDefinition;
import com.bstek.dorado.config.xml.XmlParserHelper.XmlParserInfo;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.ContextTestCase;
import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.core.xml.XercesXmlDocumentBuilder;

public class FoodParserTest extends ContextTestCase {
	private static final String MOCK_XML = "com/bstek/dorado/config/xml/Food.xml";
	private XercesXmlDocumentBuilder xmlDocumentBuilder = null;

	@Override
	protected void setUp() throws Exception {
		super.setUp();
		xmlDocumentBuilder = new XercesXmlDocumentBuilder();
	}

	@Override
	protected void tearDown() throws Exception {
		xmlDocumentBuilder = null;
		super.tearDown();
	}

	public void test() throws Exception {
		Context context = Context.getCurrent();
		Resource resource = context.getResource(MOCK_XML);
		XmlParserHelper xmlParserHelper = (XmlParserHelper) context
				.getServiceBean("xmlParserHelper");

		Document document = xmlDocumentBuilder.loadDocument(resource);
		XmlParserInfo xmlParserInfo = xmlParserHelper
				.getXmlParserInfos(Food.class).get(0);
		XmlParser foodParser = xmlParserInfo.getParser();

		ParseContext parseContext = new ParseContext();
		Element documentElement = document.getDocumentElement();
		ObjectDefinition foodDefinition = (ObjectDefinition) foodParser.parse(
				documentElement, parseContext);
		assertNotNull(foodDefinition);

		Food food = (Food) foodDefinition.create(new CreationContext());
		assertNotNull(food);
		assertEquals("Nothing to say...", food.getDescription());
	}
}
