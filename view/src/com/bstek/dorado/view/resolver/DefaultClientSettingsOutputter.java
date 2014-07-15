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

package com.bstek.dorado.view.resolver;

import java.io.IOException;
import java.io.Writer;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.core.Configure;
import com.bstek.dorado.web.DoradoContext;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2013-1-15
 */
public class DefaultClientSettingsOutputter extends ClientSettingsOutputter {

	@Override
	public void output(Writer writer) throws IOException {
		DoradoContext context = DoradoContext.getCurrent();

		writer.append("\"common.debugEnabled\":").append(
				String.valueOf(Configure.getBoolean("view.debugEnabled")));

		writeSetting(writer, "common.showExceptionStackTrace",
				Configure.getBoolean("view.showExceptionStackTrace"), false);
		writeSetting(writer, "common.enterAsTab",
				Configure.getBoolean("view.enterAsTab"), false);
		writeSetting(writer, "common.preventBackspace",
				Configure.getBoolean("view.preventBackspace"), true);

		String contextPath = Configure.getString("web.contextPath");
		if (StringUtils.isEmpty(contextPath)) {
			contextPath = context.getRequest().getContextPath();
		}
		writeSetting(writer, "common.contextPath", contextPath, true);

		writeSetting(writer, "common.abortAsyncLoadingOnSyncLoading",
				Configure.getBoolean("view.abortAsyncLoadingOnSyncLoading"),
				false);

		writeSetting(writer, "widget.skinRoot", ">dorado/client/skins/", true);
		writeSetting(writer, "widget.skin", context.getAttribute("view.skin"),
				true);
	}

}
