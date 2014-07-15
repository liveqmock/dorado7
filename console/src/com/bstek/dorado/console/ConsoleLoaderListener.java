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

import javax.servlet.ServletContextEvent;

import com.bstek.dorado.console.system.log.console.SystemOutTailWork;
import com.bstek.dorado.web.listener.DelegatingServletContextListener;

/**
 * Dorado Console Listener 启动控制台监听器
 * 
 * @author Alex Tong (mailto:alex.tong@bstek.com)
 * @since 2012-12-07
 */
public class ConsoleLoaderListener extends DelegatingServletContextListener {

	@Override
	public int getOrder() {
		return 0;
	}

	public void contextDestroyed(ServletContextEvent event) {
	}

	public void contextInitialized(ServletContextEvent event) {
		SystemOutTailWork outTailWork = SystemOutTailWork.getInstance();
		outTailWork.startWork();
		Setting.setListenerActiveState(true);
	}

}
