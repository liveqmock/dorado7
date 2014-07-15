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

package com.bstek.dorado.console.performance.listener;

import com.bstek.dorado.console.Constants;
import com.bstek.dorado.console.Logger;
import com.bstek.dorado.console.performance.ExecuteLogOutputter;
import com.bstek.dorado.console.performance.PerformanceMonitor;
import com.bstek.dorado.util.PathUtils;
import com.bstek.dorado.view.View;
import com.bstek.dorado.web.DoradoContext;

/**
 * Dorado Console ViewResolver 监听器
 * 
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * 
 */
public class ViewResolverListener implements
		com.bstek.dorado.view.resolver.ViewResolverListener {
	private static final String TYPE = "Create View";

	private String viewNamePattern;
	/**
	 * 执行日志输出器
	 */
	private ExecuteLogOutputter executeLogOutputter;

	/**
	 * @param executeLogOutputter
	 *            the executeLogOutputter to set
	 */
	public void setExecuteLogOutputter(ExecuteLogOutputter executeLogOutputter) {
		this.executeLogOutputter = executeLogOutputter;
	}

	public String getViewNamePattern() {
		return viewNamePattern;
	}

	public void setViewNamePattern(String viewNamePattern) {
		this.viewNamePattern = viewNamePattern;
	}

	public void beforeResolveView(String viewName) throws Exception {
		long startTime = System.currentTimeMillis();
		if (!PathUtils.match(viewNamePattern, viewName.replace('/', '.'))) {
			DoradoContext.getAttachedRequest().setAttribute(
					Constants.R_DORADO_CONSOLE_REQUEST_STARTTIME, startTime);
			if (Logger.getLogLevel() < 4)
				executeLogOutputter.outStartLog(TYPE, viewName, DoradoContext
						.getAttachedRequest().getRequestURI());
		}
	}

	public void afterResolveView(String viewName, View view) throws Exception {
		if (!PathUtils.match(viewNamePattern, viewName.replace('/', '.'))) {
			long endTime = System.currentTimeMillis();
			long startTime = (Long) DoradoContext.getAttachedRequest()
					.getAttribute(Constants.R_DORADO_CONSOLE_REQUEST_STARTTIME);
			PerformanceMonitor.getInstance().monitoredProcess(viewName,
					startTime, endTime, "CreateDoradoView");
			if (Logger.getLogLevel() < 4)
				executeLogOutputter.outEndLog(TYPE, viewName, null);

		}
	}

}
