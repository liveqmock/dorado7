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

package com.bstek.dorado.console.system.log.console;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.annotation.Expose;
import com.bstek.dorado.console.Setting;
import com.bstek.dorado.console.system.log.ExpirableLogBuffer;
import com.bstek.dorado.console.system.log.ExpirablePublisher;
import com.bstek.dorado.console.system.log.LogLine;
import com.bstek.dorado.view.View;
import com.bstek.dorado.web.DoradoContext;

/**
 * System.out监视器
 * 
 * @author Alex tong (mailto:alex.tong@bstek.com)
 * @since 2012-11-22
 */
public class SystemOutMonitor {

	private String listenerIdKey = "CONSOLE_LISTENER_ID_KEY";
	public void onViewInit(View view) {
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("listenerActiveState", Setting.getListenerActiveState());
		view.setUserData(map);
	}
	@Expose
	public List<LogLine> last() {

		DoradoContext ctx = DoradoContext.getCurrent();
		String listenerId = (String) ctx.getAttribute(DoradoContext.VIEW,
				listenerIdKey);

		SystemOutTailWork sysLog = SystemOutTailWork.getInstance();
		synchronized (sysLog) {
			if (!sysLog.isOnWork()) {
				sysLog.startWork();
			}
		}

		ExpirablePublisher publisher = sysLog.getPublisher();

		ExpirableLogBuffer logBuffer = null;
		if (StringUtils.isNotEmpty(listenerId)) {
			logBuffer = publisher.find(listenerId);
		}

		if (logBuffer == null) {
			logBuffer = publisher.create();
			publisher.register(logBuffer);
		}

		if (StringUtils.isEmpty(listenerId)) {
			listenerId = publisher.listenerId(logBuffer);
			ctx.setAttribute(DoradoContext.VIEW, listenerIdKey, listenerId);
		}

		return logBuffer.getLastLines();
	}

}
