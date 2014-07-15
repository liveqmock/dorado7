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

import org.aopalliance.intercept.MethodInvocation;
import org.apache.commons.lang.StringUtils;
import org.codehaus.jackson.node.ObjectNode;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.PathMatcher;

import com.bstek.dorado.common.proxy.PatternMethodInterceptor;
import com.bstek.dorado.console.Setting;
import com.bstek.dorado.data.JsonUtils;
import com.bstek.dorado.web.DoradoContext;

/**
 * ViewService 安全拦截器
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since 2013-3-4
 */
public class ViewServiceSecurityInterceptor extends PatternMethodInterceptor {
	private String serviceNamePattern;
	private static PathMatcher matcher = new AntPathMatcher();

	public String getServiceNamePattern() {
		return serviceNamePattern;
	}

	public void setServiceNamePattern(String serviceNamePattern) {
		this.serviceNamePattern = serviceNamePattern;
	}

	public Object invoke(MethodInvocation invocation) throws Throwable {
		String action, serviceName = null;

		for (Object arg : invocation.getArguments()) {
			if (arg instanceof ObjectNode) {
				ObjectNode objectNode = (ObjectNode) arg;
				action = JsonUtils.getString(objectNode, "action");
				if (action.equals("remote-service")) {
					serviceName = JsonUtils.getString(objectNode, "service");
					if (serviceName.equals("dorado.console.login#login")) {
						break;
					}
				}
				if (action.equals("resolve-data")) {
					serviceName = JsonUtils.getString(objectNode,
							"dataResolver");
				}
				if (action.equals("load-data")) {
					serviceName = JsonUtils.getString(objectNode,
							"dataProvider");
				}

				if (serviceName != null
						&& match(serviceNamePattern, serviceName)) {
					Boolean loginStatus = Setting
							.getAuthenticationManager()
							.isAuthenticated(DoradoContext.getAttachedRequest());
					if (!loginStatus) {
						throw new AccessDeniedException(
								AccessDeniedException.LOGIN_TIME_OUT_MESSAGE);
					}

				}
				break;

			}
		}

		return invocation.proceed();
	}

	/**
	 * 判断给定的字符串是否匹配通配表达式。
	 * 
	 * @param pattern
	 *            通配表达式
	 * @param text
	 *            要判断的字符串
	 * @return 是否匹配
	 */
	public static boolean match(String pattern, String text) {
		return (StringUtils.isNotEmpty(text)) ? matcher.match(pattern, text)
				: false;
	}

	public boolean check(String action, String serviceName) {
		return true;
	}
}