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

package com.bstek.dorado.console.security;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import com.bstek.dorado.console.Constants;
import com.bstek.dorado.console.Setting;
import com.bstek.dorado.util.PathUtils;
import com.bstek.dorado.view.resolver.HtmlViewResolver;

/**
 * Dorado Console HtmlView 安全拦截器
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * 
 */
public class HtmlViewSecurityInterceptor extends HandlerInterceptorAdapter {
	private String interceptedNamePattern;

	public String getInterceptedNamePattern() {
		return interceptedNamePattern;
	}

	public void setInterceptedNamePattern(String interceptedNamePattern) {
		this.interceptedNamePattern = interceptedNamePattern;
	}

	@Override
	public boolean preHandle(HttpServletRequest request,
			HttpServletResponse response, Object handler) throws Exception {
		String path = request.getRequestURI();
		Boolean loginStatus = Setting.getAuthenticationManager().isAuthenticated(request);
		if (handler instanceof HtmlViewResolver
				&& PathUtils.match(interceptedNamePattern,
						path.replace('/', '.'))) {
			if (!loginStatus
					&& path.indexOf(".dorado.console.Login") < 0) {
				response.sendRedirect(Constants.DORADO_CONSOLE_LOGIN_VIEW_PATH);
				return false;
			}
		}
		return super.preHandle(request, response, handler);
	}

}
