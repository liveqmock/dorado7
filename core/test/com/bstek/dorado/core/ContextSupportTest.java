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

package com.bstek.dorado.core;

import junit.framework.TestCase;

import com.bstek.dorado.core.CommonContext;
import com.bstek.dorado.core.ContextSupport;
import com.bstek.dorado.core.io.Resource;

public class ContextSupportTest extends TestCase {
	private ContextSupport context = null;

	@Override
	protected void setUp() throws Exception {
		super.setUp();
		context = new MockContextSupport();
	}

	@Override
	protected void tearDown() throws Exception {
		context = null;
		super.tearDown();
	}

	public void testGetAndSetAttribute() {
		String key = "key";
		Integer num = new Integer(1234);
		context.setAttribute(key, num);
		assertEquals(context.getAttribute(key), num);
	}

	public void testGetResource() {
		Resource resource = context
				.getResource("com/bstek/dorado/core/configure.properties");
		assertTrue(resource.exists());
	}
}

class MockContextSupport extends CommonContext {

}
