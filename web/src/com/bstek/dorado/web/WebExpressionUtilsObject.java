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

package com.bstek.dorado.web;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.core.Configure;
import com.bstek.dorado.util.PathUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-1-18
 */
public class WebExpressionUtilsObject {

	public String getContextPath() {
		try {
			String contextPath = Configure.getString("web.contextPath");
			if (StringUtils.isEmpty(contextPath)) {
				contextPath = DoradoContext.getAttachedRequest()
						.getContextPath();
			}
			return contextPath;
		} catch (Exception e) {
			return "/";
		}
	}

	public String url(String urlPattern) {
		if (StringUtils.isNotEmpty(urlPattern)) {
			if (urlPattern.charAt(0) == '>') {
				return PathUtils.concatPath(getContextPath(),
						urlPattern.substring(1));
			}
		}
		return urlPattern;
	}
}
