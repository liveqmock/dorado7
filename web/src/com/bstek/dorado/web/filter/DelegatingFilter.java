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

package com.bstek.dorado.web.filter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2013-1-24
 */
public abstract class DelegatingFilter {
	private int order = 999;
	private List<String> urlPatterns;
	private List<String> excludeUrlPatterns;

	public int getOrder() {
		return order;
	}

	public void setOrder(int order) {
		this.order = order;
	}

	protected List<String> formatUrlPatterns(List<String> urlPatterns) {
		if (urlPatterns == null) {
			return null;
		}

		List<String> formatedUrlPatterns = new ArrayList<String>(
				urlPatterns.size());
		for (String urlPattern : urlPatterns) {
			if (urlPattern.length() > 0 && urlPattern.charAt(0) != '/') {
				urlPattern = '/' + urlPattern;
			}
			formatedUrlPatterns.add(urlPattern);
		}
		return formatedUrlPatterns;
	}

	public List<String> getUrlPatterns() {
		return urlPatterns;
	}

	public void setUrlPatterns(List<String> urlPatterns) {
		this.urlPatterns = formatUrlPatterns(urlPatterns);
	}

	public List<String> getExcludeUrlPatterns() {
		return excludeUrlPatterns;
	}

	public void setExcludeUrlPatterns(List<String> excludeUrlPatterns) {
		this.excludeUrlPatterns = formatUrlPatterns(excludeUrlPatterns);
	}

	public abstract void doFilter(HttpServletRequest request,
			HttpServletResponse response, FilterChain chain)
			throws IOException, ServletException;
}
