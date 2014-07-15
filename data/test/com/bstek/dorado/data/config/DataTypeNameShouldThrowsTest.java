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

package com.bstek.dorado.data.config;

import junit.framework.TestCase;

public class DataTypeNameShouldThrowsTest extends TestCase {

	public void testDataTypeName1() {
		try {
			new DataTypeName("String[");
			fail();
		} catch (IllegalArgumentException e) {
		} catch (Exception e) {
			fail();
		}
	}

	public void testDataTypeName2() {
		try {
			new DataTypeName("String[]");
			fail();
		} catch (IllegalArgumentException e) {
		} catch (Exception e) {
			fail();
		}
	}

	public void testDataTypeName3() {
		try {
			new DataTypeName(" String");
			fail();
		} catch (IllegalArgumentException e) {
		} catch (Exception e) {
			fail();
		}
	}

	public void testDataTypeName4() {
		try {
			new DataTypeName("[]");
			fail();
		} catch (IllegalArgumentException e) {
		} catch (Exception e) {
			fail();
		}
	}

	public void testDataTypeName6() {
		try {
			new DataTypeName("List[String] ");
			fail();
		} catch (IllegalArgumentException e) {
		} catch (Exception e) {
			fail();
		}
	}

	public void testDataTypeName7() {
		try {
			new DataTypeName("List[String,]");
			fail();
		} catch (IllegalArgumentException e) {
		} catch (Exception e) {
			fail();
		}
	}

	public void testDataTypeName8() {
		try {
			new DataTypeName("List[String,,Bean]");
			fail();
		} catch (IllegalArgumentException e) {
		} catch (Exception e) {
			fail();
		}
	}

	public void testDataTypeName9() {
		try {
			new DataTypeName("Map[String,List[String]");
			fail();
		} catch (IllegalArgumentException e) {
		} catch (Exception e) {
			fail();
		}
	}

	public void testDataTypeName10() {
		try {
			new DataTypeName("Map[String,List[String]]]");
			fail();
		} catch (IllegalArgumentException e) {
		} catch (Exception e) {
			fail();
		}
	}
}
