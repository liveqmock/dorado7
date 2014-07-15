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

package com.bstek.dorado.view.service;

import org.aopalliance.intercept.MethodInvocation;

import com.bstek.dorado.common.proxy.PatternMethodInterceptor;
import com.bstek.dorado.web.DoradoContext;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-12-13
 */
public abstract class AbstractRemoteServiceMethodInterceptor extends
		PatternMethodInterceptor {

	public final Object invoke(MethodInvocation invocation) throws Throwable {
		String serviceName = (String) DoradoContext.getCurrent().getAttribute(
				AbstractRemoteServiceProcessor.SERVICE_NAME_ATTRIBUTE);
		return invoke(invocation, serviceName);
	}

	protected abstract Object invoke(MethodInvocation invocation,
			String serviceName) throws Throwable;
}
