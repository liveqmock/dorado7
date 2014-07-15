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

package com.bstek.dorado.console.system.log;

import java.util.Collections;
import java.util.EventListener;
import java.util.List;
import java.util.Vector;

/**
 * @author Alex tong (mailto:alex.tong@bstek.com)
 * @since 2012-11-22
 */
class LogBuffer implements EventListener {
	public static final int MAX_LOG_COUNT = 1000;

	private List<LogLine> lines = new Vector<LogLine>(MAX_LOG_COUNT);

	/**
	 * 推送一行日志
	 * 
	 * @param event
	 */
	synchronized public void onPush(Event event) {
		if (lines.size() > MAX_LOG_COUNT - 1) {
			int sz = lines.size(), gap = sz - MAX_LOG_COUNT - 1;
			for (int i = 0; i < gap; i++) {
				lines.remove(0);
			}
		}
		LogLine line = event.getObject();
		lines.add(line);
	}

	/**
	 * 判断池是否为空
	 * 
	 * @return
	 */
	synchronized public boolean isEmpty() {
		return lines.isEmpty();
	}

	/**
	 * 获取已有日志 （获取完将初始化日志池）
	 * 
	 * @return
	 */
	synchronized public List<LogLine> getLastLines() {
		if (lines.isEmpty()) {
			return null;
		} else {
			List<LogLine> last = Collections.unmodifiableList(lines);
			lines = new Vector<LogLine>(MAX_LOG_COUNT);
			return last;
		}
	}

}
