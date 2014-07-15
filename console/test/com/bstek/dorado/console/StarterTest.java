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

import static org.junit.Assert.assertEquals;

import org.junit.Before;
import org.junit.Test;

import com.bstek.dorado.console.authentication.DefaultAuthenticationManager;
import com.bstek.dorado.web.loader.ConsoleStartedMessagesOutputter;

/** 
 *
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since  2013-3-4
 */
public class StarterTest {
	Starter starter=null;

	/**
	 * @throws java.lang.Exception
	 */
	@Before
	public void setUp() throws Exception {
		starter=new Starter();
		starter.setConsoleStartedMessagesOutputter(new ConsoleStartedMessagesOutputter());
		
	}

	/**
	 * Test method for {@link com.bstek.dorado.console.Starter#onStartup()}.
	 */
	@Test
	public void testOnStartup() {
		//fail("Not yet implemented");
		try {
			starter.onStartup();
			assertEquals(Setting.getAuthenticationManager().getClass()
					.getName(),DefaultAuthenticationManager.class.getName());
		
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}
