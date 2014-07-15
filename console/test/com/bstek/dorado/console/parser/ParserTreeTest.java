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

package com.bstek.dorado.console.parser;

import org.junit.Before;
import org.junit.Test;

import com.bstek.dorado.view.ViewContextTestCase;

/**
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since 2013-3-4
 */
public class ParserTreeTest extends ViewContextTestCase {
	ParserTree parserTree = null;

	/**
	 * @throws java.lang.Exception
	 */
	@Before
	public void setUp() throws Exception {
		parserTree = new ParserTree();
		this.addExtensionContextConfigLocation("com/bstek/dorado/data/xml-parser-context.xml");
	}

	/**
	 * Test method for
	 * {@link com.bstek.dorado.console.parser.ParserTree#getModelNodes()}.
	 */
	@Test
	public void testGetModelNodes() {
		try {
			parserTree.getModelNodes();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	/**
	 * Test method for
	 * {@link com.bstek.dorado.console.parser.ParserTree#getViewConfigNodes()}.
	 */
	@Test
	public void testGetViewConfigNodes() {
		try {
			parserTree.getViewConfigNodes();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	/**
	 * Test method for
	 * {@link com.bstek.dorado.console.parser.ParserTree#getTopNodes(java.lang.String)}
	 * .
	 */
	@Test
	public void testGetTopNodes() {
		// parserTree.getTopNodes(className)
	}

}
