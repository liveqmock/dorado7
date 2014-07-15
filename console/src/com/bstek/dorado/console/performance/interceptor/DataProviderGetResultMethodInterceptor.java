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

import org.aopalliance.intercept.MethodInvocation;

import com.bstek.dorado.console.Logger;
import com.bstek.dorado.console.performance.ExecuteLogOutputter;
import com.bstek.dorado.console.performance.PerformanceMonitor;
import com.bstek.dorado.core.el.Expression;
import com.bstek.dorado.data.provider.AbstractDataProviderGetResultMethodInterceptor;
import com.bstek.dorado.data.provider.DataProvider;
import com.bstek.dorado.data.provider.Page;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.util.PathUtils;

/**
 * Dorado DataProvider 性能拦截器
 * 
 * <pre>
 * 主要记录运行日志以及运行性能信息
 * </pre>
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since 2013-3-4
 */
public class DataProviderGetResultMethodInterceptor extends
		AbstractDataProviderGetResultMethodInterceptor {

	private static final String TYPE = "DataProvider";
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
	protected Object invokeGetResult(MethodInvocation methodinvocation,
			DataProvider dataProvider, Object parameter, DataType datatype)
			throws Throwable {
		String providerName = dataProvider.getName();
		if (PathUtils.match(namePattern, providerName)) {
			return methodinvocation.proceed();
		}
		long startTime = System.currentTimeMillis();
		int logLevel = Logger.getLogLevel();
		if (logLevel < 4) {
			executeLogOutputter.outStartLog(TYPE, providerName,
					String.format("parameter={ %s }", parameter));

		}
		Object object = methodinvocation.proceed();
		if (logLevel < 4) {
			Object result = object;
			if (result instanceof Expression) {
				result = String.format("{%s}", Expression.class.getName());
			} else if (result instanceof Collection) {
				result = String.format("{%s , size = %s}",
						Collection.class.getName(),
						((Collection) result).size());
			}
			executeLogOutputter.outEndLog(TYPE, providerName,
					String.format("result= %s ", result));
		}

		long endTime = System.currentTimeMillis();
		PerformanceMonitor.getInstance().monitoredProcess(providerName,
				startTime, endTime, "DataProviderGetResult");
		return object;
	}

	@SuppressWarnings("rawtypes")
	@Override
	protected Object invokeGetPagingResult(MethodInvocation methodinvocation,
			DataProvider dataProvider, Object parameter, Page page,
			DataType datatype) throws Throwable {
		String providerName = dataProvider.getName();
		int logLevel = Logger.getLogLevel();
		if (PathUtils.match(namePattern, providerName)) {
			return methodinvocation.proceed();
		}
		long startTime = System.currentTimeMillis();
		String message;
		if (logLevel < 4) {
			message = String.format(
					"parameter= %s ,page={ pageNo = %s , pageSize = %s}",
					parameter, page.getPageNo(), page.getPageSize());
			executeLogOutputter.outStartLog("DataProvider GetPagingResult",
					providerName, message);
		}
		Object object = methodinvocation.proceed();
		if (logLevel < 4) {
			message = String.format("{Entities Size= %s ,pageCount= %s}",
					page.getEntityCount(), page.getPageCount());
			executeLogOutputter.outEndLog("DataProvider GetPagingResult",
					providerName, message);
		}

		long endTime = System.currentTimeMillis();
		PerformanceMonitor.getInstance().monitoredProcess(providerName,
				startTime, endTime, "DataProviderGetResult");
		return object;
	}
}
