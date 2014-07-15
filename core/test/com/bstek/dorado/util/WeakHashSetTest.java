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

import com.bstek.dorado.util.WeakHashSet;

import junit.framework.TestCase;

public class WeakHashSetTest extends TestCase {
	private WeakHashSet<Object> weakHashSet = null;

	@Override
	protected void setUp() throws Exception {
		super.setUp();
		weakHashSet = new WeakHashSet<Object>();
	}

	@Override
	protected void tearDown() throws Exception {
		weakHashSet = null;
		super.tearDown();
	}

	public void testAdd() {
		Object o = new Object();
		boolean actualReturn = weakHashSet.add(o);
		assertTrue(actualReturn);
		assertEquals(weakHashSet.size(), 1);
	}

}
