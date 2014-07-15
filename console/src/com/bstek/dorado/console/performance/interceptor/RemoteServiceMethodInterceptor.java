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
package com.bstek.dorado.console.performance.interceptor;

import org.aopalliance.intercept.MethodInvocation;
import org.apache.commons.lang.StringUtils;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.node.ObjectNode;

import com.bstek.dorado.common.proxy.PatternMethodInterceptor;
import com.bstek.dorado.common.service.ExposedServiceDefintion;
import com.bstek.dorado.common.service.ExposedServiceManager;
import com.bstek.dorado.console.Logger;
import com.bstek.dorado.console.performance.ExecuteLogOutputter;
import com.bstek.dorado.console.performance.PerformanceMonitor;
import com.bstek.dorado.data.JsonUtils;
import com.bstek.dorado.util.PathUtils;
import com.bstek.dorado.web.DoradoContext;

/**
 * Dorado Console RemoteService 拦截器
 * 
 * <pre>
 * 主要记录运行日志以及运行性能信息
 * </pre>
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * 
 */
public class RemoteServiceMethodInterceptor extends PatternMethodInterceptor {
	private static final String TYPE = "service";
	/**
	 * 拦截DataProvidater 规则
	 */
	private String namePattern;
	/**
	 * 执行日志输出器
	 */
	private ExecuteLogOutputter executeLogOutputter;

	public String getNamePattern() {
		return namePattern;
	}

	public void setNamePattern(String namePattern) {
		this.namePattern = namePattern;
	}

	/**
	 * @param executeLogOutputter
	 *            the executeLogOutputter to set
	 */
	public void setExecuteLogOutputter(ExecuteLogOutputter executeLogOutputter) {
		this.executeLogOutputter = executeLogOutputter;
	}

	public Object invoke(MethodInvocation invocation) throws Throwable {
		String serviceName = null, parameter = null, metaData = null;
		Object object = null;
		long startTime = System.currentTimeMillis();
		int logLevel = Logger.getLogLevel();
		for (Object arg : invocation.getArguments()) {
			if (arg instanceof ObjectNode) {
				ObjectNode objectNode = (ObjectNode) arg;
				try {
					serviceName = JsonUtils.getString(objectNode, "service");
					if (StringUtils.isNotEmpty(serviceName) && logLevel < 4) {
						ExposedServiceManager exposedServiceManager = (ExposedServiceManager) DoradoContext
								.getCurrent().getServiceBean(
										"exposedServiceManager");
						ExposedServiceDefintion exposedService = exposedServiceManager
								.getService(serviceName);
						if (exposedService == null) {
							throw new IllegalArgumentException(
									"Unknown ExposedService [" + serviceName
											+ "].");
						}
						JsonNode paramJson = objectNode.get("parameter"), metaJson = objectNode
								.get("sysParameter");
						parameter = paramJson == null ? "" : paramJson
								.toString();
						metaData = metaJson == null ? "" : metaJson
								.toString();

						break;
					}
				} catch (Exception e) {
				}

			}
		}

		if (StringUtils.isNotEmpty(serviceName)
				&& !PathUtils.match(namePattern, serviceName)) {

			if (logLevel < 4)
				executeLogOutputter.outStartLog(TYPE, serviceName,
						String.format("parameter=%s,metaData=%s", parameter,
								metaData));
			object = invocation.proceed();
			if (logLevel < 4)
				executeLogOutputter.outEndLog(TYPE, serviceName, "");

			long endTime = System.currentTimeMillis();

			PerformanceMonitor.getInstance().monitoredProcess(serviceName,
					startTime, endTime, "RemoteService");

		} else {
			object = invocation.proceed();
		}
		return object;
	}
}
