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

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.junit.Test;

import com.bstek.dorado.console.addon.AddonController;
import com.bstek.dorado.console.authentication.OpenAuthenticationManager;
import com.bstek.dorado.core.el.ContextVarsInitializer;
import com.bstek.dorado.core.el.DefaultExpressionHandler;
import com.bstek.dorado.core.el.DefaultExpressionHandlerTest;

/**
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since 2013-3-4
 */
public class MainTest extends DefaultExpressionHandlerTest {
	private static class MockVarsInitializer implements ContextVarsInitializer {
		public void initializeContext(Map<String, Object> vars) {
			vars.put("Runtime", Runtime.getRuntime());
		}
	};
	private Main main;
	private DefaultExpressionHandler defaultExpressionHandler = new DefaultExpressionHandler();

	@Override
	protected void setUp() throws Exception {
		super.setUp();
		List<ContextVarsInitializer> initializers = new ArrayList<ContextVarsInitializer>();
		initializers.add(new MockVarsInitializer());
		defaultExpressionHandler.setContextInitializers(initializers);
	
		Setting.setStartTime(new Date().getTime());
		Setting.setAuthenticationManager(new OpenAuthenticationManager());
		main = new Main();
		main.setAddonController(new AddonController());
		main.setExpressionHandler(defaultExpressionHandler);
	}


	@Test
	public void testOnViewInit() {
//		View view = new MockView(null);
//		Accordion accordionMenu=new Accordion();
		//main.onViewInit(view, accordionMenu);
		
	}

}
