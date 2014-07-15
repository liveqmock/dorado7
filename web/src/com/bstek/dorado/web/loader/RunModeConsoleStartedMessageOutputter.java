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

package com.bstek.dorado.web.loader;

import java.io.Writer;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.core.Configure;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2013-1-22
 */
public class RunModeConsoleStartedMessageOutputter extends
		ConsoleStartedMessageOutputter {

	@Override
	public void output(Writer writer) throws Exception {
		String runMode = Configure.getString("core.runMode");
		if (StringUtils.isNotEmpty(runMode)
				&& !"production".equalsIgnoreCase(runMode)) {
			writer.append("WARN:\n")
					.append("Dorado is currently running in "
							+ runMode
							+ " mode, you may need to change the setting for \"core.runMode\".");
		}
	}

}
