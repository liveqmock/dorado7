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

import java.util.Collection;
import java.util.Comparator;
import java.util.TreeSet;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import com.bstek.dorado.core.pkgs.PackageInfo;
import com.bstek.dorado.core.pkgs.PackageManager;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2013-2-2
 */
public final class DelegatingServletContextListenersManager {
	private DelegatingServletContextListenersManager() {
	}

	private static Collection<ServletContextListener> servletContextListeners;

	public static void fireContextInitialized(ServletContextEvent event)
			throws Exception {
		servletContextListeners = new TreeSet<ServletContextListener>(
				new Comparator<ServletContextListener>() {
					private static final int DEFAULT_ORDER = DelegatingServletContextListener.DEFAULT_ORDER;

					public int compare(ServletContextListener l1,
							ServletContextListener l2) {
						int o1 = (l1 instanceof DelegatingServletContextListener) ? ((DelegatingServletContextListener) l1)
								.getOrder() : DEFAULT_ORDER;
						int o2 = (l2 instanceof DelegatingServletContextListener) ? ((DelegatingServletContextListener) l2)
								.getOrder() : DEFAULT_ORDER;
						return o1 - o2;
					}
				});

		for (PackageInfo packageInfo : PackageManager.getPackageInfoMap()
				.values()) {
			if (packageInfo.getServletContextListener() != null) {
				servletContextListeners.add(packageInfo
						.getServletContextListener());
			}
		}

		if (servletContextListeners.isEmpty()) {
			servletContextListeners = null;
		} else {
			for (ServletContextListener listener : servletContextListeners) {
				listener.contextInitialized(event);
			}
		}
	}

	public static void fireContextDestroyed(ServletContextEvent event)
			throws Exception {
		if (servletContextListeners != null) {
			for (ServletContextListener listener : servletContextListeners) {
				listener.contextDestroyed(event);
			}
		}
	}
}
