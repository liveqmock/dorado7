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

package com.bstek.dorado.console.runtime;

import org.junit.Before;
import org.junit.Test;

import com.bstek.dorado.core.ContextTestCase;
import com.bstek.dorado.view.MockView;
import com.bstek.dorado.view.View;

/**
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since 2013-3-4
 */
public class SystemPropertyControllerTest extends ContextTestCase {
	SystemPropertyController controller = null;

	/**
	 * @throws java.lang.Exception
	 */
	@Before
	public void setUp() throws Exception {
		controller = new SystemPropertyController();
	}

	/**
	 * Test method for
	 * {@link com.bstek.dorado.console.runtime.SystemPropertyController#onReady(com.bstek.dorado.view.View)}
	 * .
	 */
	@Test
	public void testOnReady() {
		View view = new MockView(null);
		controller.onReady(view);
	}

	/**
	 * Test method for
	 * {@link com.bstek.dorado.console.runtime.SystemPropertyController#doForceGC()}
	 * .
	 */
	@Test
	public void testDoForceGC() {
		controller.doForceGC();
	}

}
