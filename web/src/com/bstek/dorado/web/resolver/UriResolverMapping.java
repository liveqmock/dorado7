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

import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.util.PathMatcher;
import org.springframework.web.servlet.handler.AbstractUrlHandlerMapping;

import com.bstek.dorado.util.Assert;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-7-15
 */
public class UriResolverMapping extends AbstractUrlHandlerMapping {
	private static final Log logger = LogFactory
			.getLog(UriResolverMapping.class);

	@Override
	protected Object lookupHandler(String urlPath, HttpServletRequest request)
			throws Exception {
		Map<String, Object> handlerMap = getHandlerMap();
		Object handler = handlerMap.get(urlPath);
		String bestPatternMatch = urlPath;
		String pathWithinMapping = urlPath;

		if (handler == null) {
			PathMatcher pathMatcher = getPathMatcher();
			for (Iterator<String> it = handlerMap.keySet().iterator(); it
					.hasNext();) {
				String registeredPath = it.next();
				if (pathMatcher.match(registeredPath, urlPath)) {
					request.setAttribute("originalUrlPath", urlPath);
					handler = handlerMap.get(registeredPath);
					bestPatternMatch = registeredPath;
					pathWithinMapping = pathMatcher.extractPathWithinPattern(
							bestPatternMatch, urlPath);
					break;
				}
			}
		}

		if (handler != null) {
			PathMatcher pathMatcher = getPathMatcher();
			Map<String, String> uriTemplateVariables = new LinkedHashMap<String, String>();
			uriTemplateVariables.putAll(pathMatcher
					.extractUriTemplateVariables(bestPatternMatch, urlPath));

			if (logger.isDebugEnabled()) {
				logger.debug("URI Template variables for request [" + urlPath
						+ "] are " + uriTemplateVariables);
			}
			handler = buildPathExposingHandler(handler, bestPatternMatch,
					pathWithinMapping, uriTemplateVariables);
		}

		return handler;
	}

	@Override
	public void registerHandler(String urlPath, Object handler) {
		Assert.notNull(urlPath, "URL path must not be null");
		if (!urlPath.startsWith("/")) {
			urlPath = "/" + urlPath;
		}
		super.registerHandler(urlPath, handler);
	}
}
