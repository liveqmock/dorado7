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

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;

import com.bstek.dorado.core.Configure;
import com.bstek.dorado.util.PathUtils;
import com.bstek.dorado.web.DoradoContext;

/**
 * 使请求支持WebContext的抽象Web控制器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Oct 6, 2008
 */
public abstract class WebContextSupportedController extends AbstractController {
	private static final char ESCAPED_PATH_DELIM = '^';

	private String getContextPath(HttpServletRequest request) {
		return request.getContextPath();
	}

	/**
	 * 返回请求的相对URI，即相对于应用的ContentPath的URI。
	 */
	protected String getRelativeRequestURI(HttpServletRequest request)
			throws UnsupportedEncodingException {
		String uri = (String) request.getAttribute("originalUrlPath");
		if (uri == null) {
			uri = request.getRequestURI().substring(
					getContextPath(request).length());
		}
		uri = StringUtils
				.replaceChars(
						URLDecoder.decode(uri,
								Configure.getString("view.uriEncoding")),
						ESCAPED_PATH_DELIM, PathUtils.PATH_DELIM);
		if (uri.length() > 1 && uri.charAt(0) == PathUtils.PATH_DELIM) {
			uri = uri.substring(1);
		}
		return uri;
	}

	protected abstract ModelAndView doHandleRequest(HttpServletRequest request,
			HttpServletResponse response) throws Exception;

	@Override
	protected final ModelAndView handleRequestInternal(
			HttpServletRequest request, HttpServletResponse response)
			throws Exception {
		DoradoContext.init(getServletContext(), request);
		try {
			return doHandleRequest(request, response);
		} finally {
			DoradoContext.dispose(request);
		}
	}

}
