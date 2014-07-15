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

package com.bstek.dorado.web.resolver;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.Controller;

import com.bstek.dorado.util.PathUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2013-1-23
 */
public abstract class AbstractControllerResolver extends
		WebContextSupportedController {
	private String uriPrefix;
	private int uriPrefixLen;
	private String uriSuffix = ".c";
	private int uriSuffixLen = uriSuffix.length();

	public void setUriPrefix(String uriPrefix) {
		if (uriPrefix != null && uriPrefix.charAt(0) == PathUtils.PATH_DELIM) {
			uriPrefix = uriPrefix.substring(1);
		}
		this.uriPrefix = uriPrefix;
		uriPrefixLen = (uriPrefix != null) ? uriPrefix.length() : 0;
	}

	public void setUriSuffix(String uriSuffix) {
		this.uriSuffix = uriSuffix;
		uriSuffixLen = (uriSuffix != null) ? uriSuffix.length() : 0;
	}

	protected String extractControllerName(String uri) {
		String controllerName = StringUtils.substringBefore(uri, ";");
		if (uriPrefix != null && controllerName.startsWith(uriPrefix)) {
			controllerName = controllerName.substring(uriPrefixLen);
		}
		if (uriSuffix != null && controllerName.endsWith(uriSuffix)) {
			controllerName = controllerName.substring(0,
					controllerName.length() - uriSuffixLen);
		}
		return controllerName;
	}

	@Override
	protected ModelAndView doHandleRequest(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		String uri = getRelativeRequestURI(request);
		if (!PathUtils.isSafePath(uri)) {
			throw new PageAccessDeniedException("[" + request.getRequestURI()
					+ "] Request forbidden.");
		}

		String controllerName = extractControllerName(uri);
		Controller controller = getController(controllerName);
		return controller.handleRequest(request, response);
	}

	protected abstract Controller getController(String controllerName)
			throws Exception;
}
