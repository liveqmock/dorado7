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

package com.bstek.dorado.config.text;

import java.util.Map;

import junit.framework.TestCase;


import com.bstek.dorado.config.text.ConfigurableDispatchableTextParser;
import com.bstek.dorado.config.text.ConfigutableTextAttributeParser;
import com.bstek.dorado.config.text.DispatchableTextParser;
import com.bstek.dorado.config.text.TextParseContext;
import com.bstek.dorado.config.text.TextParser;
import com.bstek.dorado.core.el.CombinedExpression;
import com.bstek.dorado.core.el.DefaultExpressionHandler;
import com.bstek.dorado.core.el.SingleExpression;

@SuppressWarnings("unchecked")
public class DispatchableTextParserTest extends TestCase {
	private TextParser getTextParser(boolean hasHeader) {
		ConfigurableDispatchableTextParser dispatchableTextParser = new ConfigurableDispatchableTextParser();
		dispatchableTextParser.setHasHeader(hasHeader);
		ConfigutableTextAttributeParser attributeParser = new ConfigutableTextAttributeParser();
		attributeParser.setExpressionHandler(new DefaultExpressionHandler());
		dispatchableTextParser.registerAttributeParser(
				DispatchableTextParser.WILDCARD, attributeParser);
		return dispatchableTextParser;
	}

	public void test1() throws Exception {
		TextParser parser = getTextParser(false);
		final String text = "key1: value1; key2: value2; "
				+ "key3: value 3; key4: A${someExpression}B; "
				+ "key5: ${someExpression}";
		Map<String, Object> attributes = (Map<String, Object>) parser.parse(
				text.toCharArray(), new TextParseContext());

		assertNotNull(attributes);
		assertEquals("value1", attributes.get("key1"));
		assertEquals("value2", attributes.get("key2"));
		assertEquals("value 3", attributes.get("key3"));

		Object value4 = attributes.get("key4");
		assertNotNull(value4);
		assertTrue(CombinedExpression.class.isInstance(value4));

		Object value5 = attributes.get("key5");
		assertNotNull(value5);
		assertTrue(SingleExpression.class.isInstance(value5));
	}

	public void test2() throws Exception {
		TextParser parser = getTextParser(true);
		final String text = "header1 key1: value1";
		Map<String, Object> attributes = (Map<String, Object>) parser.parse(
				text.toCharArray(), new TextParseContext());

		assertNotNull(attributes);
		assertEquals("header1", attributes.get("$header"));
		assertEquals("value1", attributes.get("key1"));
	}

	public void test3() throws Exception {
		TextParser parser = getTextParser(false);
		final String text = "left: 100; top: 200";
		Map<String, Object> attributes = (Map<String, Object>) parser.parse(
				text.toCharArray(), new TextParseContext());

		assertNotNull(attributes);
		assertEquals("100", attributes.get("left"));
		assertEquals("200", attributes.get("top"));
	}

	public void test4() throws Exception {
		TextParser parser = getTextParser(true);
		final String text = "TheHeader";
		Map<String, Object> attributes = (Map<String, Object>) parser.parse(
				text.toCharArray(), new TextParseContext());

		assertNotNull(attributes);
		assertEquals("TheHeader", attributes.get("$header"));
	}
}
