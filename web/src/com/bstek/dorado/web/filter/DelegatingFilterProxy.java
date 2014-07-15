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
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import org.springframework.util.AntPathMatcher;
import org.springframework.util.PathMatcher;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2013-1-24
 */
public class DelegatingFilterProxy implements Filter {
	private List<DelegatingFilter> targetFilters;
	private PathMatcher pathMatcher;

	public void init(FilterConfig filterConfig) throws ServletException {
	}

	private WebApplicationContext getWebApplicationContext(
			ServletRequest request) {
		WebApplicationContext wac = WebApplicationContextUtils
				.getWebApplicationContext(((HttpServletRequest) request)
						.getSession().getServletContext());
		return wac;
	}

	@SuppressWarnings("unchecked")
	private List<DelegatingFilter> getTargetFilters(ServletRequest request) {
		if (targetFilters == null) {
			WebApplicationContext wac = getWebApplicationContext(request);
			Map<String, DelegatingFilter> targetFilterMap = wac
					.getBeansOfType(DelegatingFilter.class);

			if (targetFilterMap.isEmpty()) {
				targetFilters = Collections.EMPTY_LIST;
			} else {
				Set<DelegatingFilter> treeSet = new TreeSet<DelegatingFilter>(
						new Comparator<DelegatingFilter>() {
							public int compare(DelegatingFilter o1,
									DelegatingFilter o2) {
								int gap = o1.getOrder() - o2.getOrder();
								if (gap != 0) {
									return gap;
								}
								return (o1 == o2) ? 0 : 1;
							}
						});
				treeSet.addAll(targetFilterMap.values());
				targetFilters = new ArrayList<DelegatingFilter>(treeSet);
			}
		}
		return targetFilters;
	}

	private PathMatcher getPathMatcher(ServletRequest request) {
		if (pathMatcher == null) {
			WebApplicationContext wac = getWebApplicationContext(request);
			if (wac.containsBean("dorado.pathMatcher")) {
				pathMatcher = (PathMatcher) wac.getBean("dorado.pathMatcher");
			} else {
				pathMatcher = new AntPathMatcher();
			}
		}
		return pathMatcher;
	}

	public void doFilter(ServletRequest request, ServletResponse response,
			FilterChain chain) throws IOException, ServletException {
		List<DelegatingFilter> filters = getTargetFilters(request);
		if (filters.isEmpty()) {
			chain.doFilter(request, response);
		} else {
			DelegatingFilterChain delegatingFilterChain = new DelegatingFilterChain(
					filters, getPathMatcher(request), chain);
			delegatingFilterChain.doFilter(request, response);
		}
	}

	public void destroy() {
	}

}
