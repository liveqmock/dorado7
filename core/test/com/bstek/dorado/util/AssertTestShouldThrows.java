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

package com.bstek.dorado.util;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Vector;

import junit.framework.TestCase;

public class AssertTestShouldThrows extends TestCase {
	public void testDoesNotContain() {
		try {
			Assert.doesNotContain("abcdefg", "cd");

			fail();
		} catch (IllegalArgumentException e) {
		} catch (Exception e) {
			fail();
		}
	}

	public void testIsAssignable() {
		try {
			Assert.isAssignable(Vector.class, List.class);

			fail();
		} catch (IllegalArgumentException e) {
		} catch (Exception e) {
			fail();
		}
	}

	public void testIsInstanceOf() {
		try {
			Assert.isInstanceOf(List.class, new HashMap<Object, Object>());

			fail();
		} catch (IllegalArgumentException e) {
		} catch (Exception e) {
			fail();
		}
	}

	public void testIsNull() {
		try {
			Assert.isNull(new Object());

			fail();
		} catch (IllegalArgumentException e) {
		} catch (Exception e) {
			fail();
		}
	}

	public void testNotNull() {
		try {
			Assert.notNull(null);

			fail();
		} catch (IllegalArgumentException e) {
		} catch (Exception e) {
			fail();
		}
	}

	public void testIsTrue() {
		try {
			Assert.isTrue(2 < 1);

			fail();
		} catch (IllegalArgumentException e) {
		} catch (Exception e) {
			fail();
		}
	}

	public void testArrayNotEmpty() {
		try {
			Assert.notEmpty(new String[0]);

			fail();
		} catch (IllegalArgumentException e) {
		} catch (Exception e) {
			fail();
		}
	}

	public void testCollectionNotEmpty() {
		try {
			List<Object> list = new Vector<Object>();
			Assert.notEmpty(list);

			fail();
		} catch (IllegalArgumentException e) {
		} catch (Exception e) {
			fail();
		}
	}

	public void testMapNotEmpty() {
		try {
			Map<Object, Object> map = new HashMap<Object, Object>();
			Assert.notEmpty(map);

			fail();
		} catch (IllegalArgumentException e) {
		} catch (Exception e) {
			fail();
		}
	}

}
