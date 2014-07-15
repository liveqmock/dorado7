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

import junit.framework.TestCase;

import com.bstek.dorado.core.el.DefaultExpressionHandler;

public class DispatchableTextParserTestShouldThrows extends TestCase {

	private TextParser getTextParser(boolean hasHeader) {
		ConfigurableDispatchableTextParser dispatchableTextParser = new ConfigurableDispatchableTextParser();
		dispatchableTextParser.setHasHeader(hasHeader);
		ConfigutableTextAttributeParser attributeParser = new ConfigutableTextAttributeParser();
		attributeParser.setExpressionHandler(new DefaultExpressionHandler());
		dispatchableTextParser.registerAttributeParser(
				DispatchableTextParser.WILDCARD, attributeParser);
		return dispatchableTextParser;
	}

	private void doTestParse(String text) throws Exception {
		TextParser parser = getTextParser(false);
		parser.parse(text.toCharArray(), new TextParseContext());
	}

	private void doTestParseWithHeaderSupported(String text) throws Exception {
		TextParser parser = getTextParser(true);
		parser.parse(text.toCharArray(), new TextParseContext());
	}

	public void test1() throws Exception {
		try {
			doTestParse("123: 456");

			fail();
		} catch (TextParseException e) {
		} catch (Exception e) {
			fail();
		}
	}

	public void test2() throws Exception {
		try {
			doTestParse("key 1: 456");

			fail();
		} catch (TextParseException e) {
		} catch (Exception e) {
			fail();
		}
	}

	public void test3() throws Exception {
		try {
			doTestParse("key\t1: 456");

			fail();
		} catch (TextParseException e) {
		} catch (Exception e) {
			fail();
		}
	}

	public void test4() throws Exception {
		try {
			doTestParse("key1;: 456");

			fail();
		} catch (TextParseException e) {
		} catch (Exception e) {
			fail();
		}
	}

	public void test5() throws Exception {
		try {
			doTestParse("  : 456");

			fail();
		} catch (TextParseException e) {
		} catch (Exception e) {
			fail();
		}
	}

	public void test6() throws Exception {
		try {
			doTestParse("abcd");

			fail();
		} catch (TextParseException e) {
		} catch (Exception e) {
			fail();
		}
	}

	public void test7() throws Exception {
		try {
			doTestParseWithHeaderSupported(";key1: 456");

			fail();
		} catch (TextParseException e) {
		} catch (Exception e) {
			fail();
		}
	}

	public void test8() throws Exception {
		try {
			doTestParseWithHeaderSupported("abcd; key1: 456");

			fail();
		} catch (TextParseException e) {
		} catch (Exception e) {
			fail();
		}
	}
}
