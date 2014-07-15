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

package com.bstek.dorado.idesupport.robot;

import java.util.HashMap;
import java.util.Map;

import com.bstek.dorado.web.DoradoContext;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-9-23
 */
@Deprecated
public class RobotRegistry {
	private Map<String, RobotInfo> robotMap = new HashMap<String, RobotInfo>();

	public Map<String, RobotInfo> getRobotMap() {
		return robotMap;
	}

	public Robot getRobot(String name) throws Exception {
		if (robotMap == null) {
			throw new IllegalStateException("\"robotMap\" not initialized.");
		}

		Robot robot = null;
		RobotInfo robotInfo = robotMap.get(name);
		if (robotInfo != null) {
			Object robotDef = robotInfo.getRobot();
			if (robotDef instanceof Robot) {
				robot = (Robot) robotDef;
			} else if (robotDef instanceof String) {
				DoradoContext context = DoradoContext.getCurrent();
				robot = (Robot) context.getApplicationContext().getBean(
						(String) robotDef);
			}
		}

		return robot;
	}
}
