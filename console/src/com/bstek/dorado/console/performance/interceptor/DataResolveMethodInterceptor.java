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

import java.util.Collection;
import java.util.Map;

import org.aopalliance.intercept.MethodInvocation;

import com.bstek.dorado.console.Logger;
import com.bstek.dorado.console.performance.ExecuteLogOutputter;
import com.bstek.dorado.console.performance.PerformanceMonitor;
import com.bstek.dorado.data.entity.EntityUtils;
import com.bstek.dorado.data.resolver.AbstractDataResolverMethodInterceptor;
import com.bstek.dorado.data.resolver.DataItems;
import com.bstek.dorado.data.resolver.DataResolver;
import com.bstek.dorado.util.PathUtils;

/**
 * Dorado Console DataResolve Method 性能拦截器
 * 
 * <pre>
 * 主要记录运行日志以及运行性能信息
 * </pre>
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com) processor
 */
public class DataResolveMethodInterceptor extends
		AbstractDataResolverMethodInterceptor {
	private static final String TYPE = "DataResolve";
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

	@SuppressWarnings("rawtypes")
	@Override
	protected Object invokeResolve(MethodInvocation methodInvocation,
			DataResolver dataResolver, DataItems dataItems, Object parameter)
			throws Throwable {
		if (PathUtils.match(namePattern, dataResolver.getName())) {
			return methodInvocation.proceed();
		}

		long startTime = System.currentTimeMillis();
		String resolverName = dataResolver.getName();
		int logLevel = Logger.getLogLevel();
		if (logLevel < 4) {
			StringBuffer buffer = null;
			for (Map.Entry<String, Object> entry : dataItems.entrySet()) {
				String key = entry.getKey();
				Object object = entry.getValue();
				if (buffer == null) {
					buffer = new StringBuffer();
				} else {
					buffer.append(",");
				}
				buffer.append(key).append(" = ");
				if (object == null
						|| EntityUtils.isSimpleType(object.getClass())) {
					buffer.append(object);
				} else if (object instanceof Collection) {
					Collection list = (Collection) object;
					buffer.append("{").append(object.getClass().getName())
							.append(" , size=").append(list.size()).append("}");
				} else {
					buffer.append(" { ").append(object).append(" } ");
				}
			}
			executeLogOutputter.outStartLog(TYPE, resolverName, String.format(
					"dataItems=[ %s ], parameter={ %s }", buffer, parameter));
		}
		Object object = methodInvocation.proceed();

		if (logLevel < 4)
			executeLogOutputter.outEndLog(TYPE, resolverName, "");

		long endTime = System.currentTimeMillis();
		PerformanceMonitor.getInstance().monitoredProcess(
				dataResolver.getName(), startTime, endTime, "DataResolve");
		return object;

	}

}