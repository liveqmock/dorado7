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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.console.authentication.AuthenticationManager;
import com.bstek.dorado.console.authentication.DefaultAuthenticationManager;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.EngineStartupListener;
import com.bstek.dorado.web.loader.ConsoleStartedMessagesOutputter;

/**
 * Dorado Console Starter
 * 
 * @author Alex Tong (mailto:alex.tong@bstek.com)
 * @since 2012-12-27
 */

public class Starter extends EngineStartupListener {
	private static Log logger = LogFactory.getLog(Starter.class);
	private ConsoleStartedMessagesOutputter consoleStartedMessagesOutputter;

	public void setConsoleStartedMessagesOutputter(
			ConsoleStartedMessagesOutputter consoleStartedMessagesOutputter) {
		this.consoleStartedMessagesOutputter = consoleStartedMessagesOutputter;
	}

	@Override
	public void onStartup() throws Exception {
		Setting.setStartTime(System.currentTimeMillis());
		AuthenticationManager authenticationManager = null;
		Context ctx = Context.getCurrent();
		try {
			authenticationManager = (AuthenticationManager) ctx
					.getServiceBean("authenticationManager");
		} catch (Exception e) {
			logger.warn(e);
			DefaultAuthenticationManager defaultAuthenticationManager = new DefaultAuthenticationManager();
			
			defaultAuthenticationManager
					.setConsoleStartedMessagesOutputter(consoleStartedMessagesOutputter);
			defaultAuthenticationManager.afterPropertiesSet();
			authenticationManager=defaultAuthenticationManager;
		}
		
		
		Setting.setAuthenticationManager(authenticationManager);

	}

}
