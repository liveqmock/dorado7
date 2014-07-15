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

package com.bstek.dorado.console;

import static org.junit.Assert.*;

import org.junit.Test;

/** 
 *
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since  2013-3-4
 */
public class ConsoleConfigureTest {

//	/**
//	 * Test method for {@link com.bstek.dorado.console.ConsoleConfigure#get(java.lang.String)}.
//	 */
//	@Test
//	public void testGet() {
//		fail("Not yet implemented");
//	}

	/**
	 * Test method for {@link com.bstek.dorado.console.ConsoleConfigure#getString(java.lang.String)}.
	 */
	@Test
	public void testGetString() {
		String value=ConsoleConfigure.getString( "dorado.console.webConfigure.variable.properties");
		assertEquals("[view.styleSheet.charset,view.mergeStyleSheet,view.skin,view.useMinifiedStyleSheet,view.useRandomStringAlias,view.javaScript.charset,view.debugEnabled,view.useMinifiedJavaScript,view.javaScript.asControllerInDefault,view.outputPrettyJson,view.mergeJavaScript,view.enterAsTab,view.uriEncoding]", value);
	}

//	/**
//	 * Test method for {@link com.bstek.dorado.console.ConsoleConfigure#getBoolean(java.lang.String)}.
//	 */
//	@Test
//	public void testGetBoolean() {
//		fail("Not yet implemented");
//	}
//
//	/**
//	 * Test method for {@link com.bstek.dorado.console.ConsoleConfigure#getLong(java.lang.String)}.
//	 */
//	@Test
//	public void testGetLong() {
//		fail("Not yet implemented");
//	}

}
