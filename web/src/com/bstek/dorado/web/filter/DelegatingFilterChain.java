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
import java.util.List;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.util.PathMatcher;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2013-1-24
 */
public class DelegatingFilterChain implements FilterChain {
	private List<DelegatingFilter> targetFilters;
	private int index = 0;
	private PathMatcher pathMatcher;
	private FilterChain realFilterChain;

	public DelegatingFilterChain(List<DelegatingFilter> targetFilters,
			PathMatcher pathMatcher, FilterChain realFilterChain) {
		this.targetFilters = targetFilters;
		this.pathMatcher = pathMatcher;
		this.realFilterChain = realFilterChain;
	}

	private String getContextPath(HttpServletRequest request) {
		return request.getContextPath();
	}

	private String getPath(HttpServletRequest request) {
		return request.getRequestURI().substring(
				getContextPath(request).length());
	}

	public void doFilter(ServletRequest request, ServletResponse response)
			throws IOException, ServletException {
		boolean matched = false;
		int filterNum = targetFilters.size();
		if (index >= filterNum) {
			realFilterChain.doFilter(request, response);
		} else {
			while (index < filterNum) {
				DelegatingFilter targetFilter = targetFilters.get(index);
				index++;

				List<String> urlPatterns = targetFilter.getUrlPatterns();
				if (urlPatterns != null) {
					String path = getPath((HttpServletRequest) request);
					for (String pattern : urlPatterns) {
						if (pathMatcher.match(pattern, path)) {
							matched = true;
							break;
						}
					}

					if (matched) {
						List<String> excludeUrlPatterns = targetFilter
								.getExcludeUrlPatterns();
						if (excludeUrlPatterns != null) {
							for (String pattern : excludeUrlPatterns) {
								if (pathMatcher.match(pattern, path)) {
									matched = false;
									break;
								}
							}
						}
					}
				} else {
					matched = true;
				}

				if (matched) {
					targetFilter.doFilter((HttpServletRequest) request,
							(HttpServletResponse) response, this);
					break;
				}
			}

			if (!matched) {
				realFilterChain.doFilter(request, response);
			}
		}
	}
}
