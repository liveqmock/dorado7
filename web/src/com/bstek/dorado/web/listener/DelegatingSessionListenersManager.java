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

package com.bstek.dorado.web.listener;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2013-2-2
 */
public final class DelegatingSessionListenersManager {
	private DelegatingSessionListenersManager() {
	}

	private static Collection<HttpSessionListener> sessionListeners;

	private static WebApplicationContext getWebApplicationContext(
			ServletContext servletContext) {
		WebApplicationContext wac = WebApplicationContextUtils
				.getWebApplicationContext(servletContext);
		return wac;
	}

	@SuppressWarnings("unchecked")
	private static Collection<HttpSessionListener> getSessionListeners(
			HttpSessionEvent event) {
		if (sessionListeners == null) {
			WebApplicationContext wac = getWebApplicationContext(event
					.getSession().getServletContext());
			Map<String, HttpSessionListener> sessionListenerMap = wac
					.getBeansOfType(HttpSessionListener.class);

			if (sessionListenerMap.isEmpty()) {
				sessionListeners = Collections.EMPTY_LIST;
			} else {
				Set<HttpSessionListener> treeSet = new TreeSet<HttpSessionListener>(
						new Comparator<HttpSessionListener>() {
							private static final int DEFAULT_ORDER = DelegatingServletContextListener.DEFAULT_ORDER;

							public int compare(HttpSessionListener l1,
									HttpSessionListener l2) {
								int o1 = (l1 instanceof DelegatingSessionListener) ? ((DelegatingSessionListener) l1)
										.getOrder() : DEFAULT_ORDER;
								int o2 = (l2 instanceof DelegatingSessionListener) ? ((DelegatingSessionListener) l2)
										.getOrder() : DEFAULT_ORDER;
								return o1 - o2;
							}
						});
				treeSet.addAll(sessionListenerMap.values());
				sessionListeners = new ArrayList<HttpSessionListener>(treeSet);
			}
		}
		return sessionListeners;
	}

	public static void fireSessionCreated(HttpSessionEvent event)
			throws Exception {
		Collection<HttpSessionListener> sessionListeners = getSessionListeners(event);
		for (HttpSessionListener listener : sessionListeners) {
			listener.sessionCreated(event);
		}
	}

	public static void fireSessionDestroyed(HttpSessionEvent event)
			throws Exception {
		Collection<HttpSessionListener> sessionListeners = getSessionListeners(event);
		for (HttpSessionListener listener : sessionListeners) {
			listener.sessionDestroyed(event);
		}
	}
}
