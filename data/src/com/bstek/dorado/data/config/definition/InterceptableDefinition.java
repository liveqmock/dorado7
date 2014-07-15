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

package com.bstek.dorado.data.config.definition;

import org.aopalliance.intercept.MethodInterceptor;
import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.config.definition.CreationContext;
import com.bstek.dorado.config.definition.ObjectDefinition;

public abstract class InterceptableDefinition extends ListenableObjectDefinition {
	private String interceptor;

	/**
	 * 返回DataProvider的拦截器。
	 */
	public String getInterceptor() {
		return interceptor;
	}

	/**
	 * 设置DataProvider的拦截器。
	 */
	public void setInterceptor(String interceptor) {
		this.interceptor = interceptor;
	}

	@Override
	protected void initCreationInfo(CreationInfo creationInfo,
			ObjectDefinition definition, boolean processConstrInfos)
			throws Exception {
		super.initCreationInfo(creationInfo, definition, processConstrInfos);
		InterceptableDefinition interceptableDefinition = (InterceptableDefinition) definition;
		creationInfo.setUserData("interceptor",
				interceptableDefinition.getInterceptor());
	}

	@Override
	protected MethodInterceptor[] getMethodInterceptors(
			CreationInfo creationInfo, CreationContext context)
			throws Exception {
		MethodInterceptor[] interceptors = null;
		String interceptor = (String) creationInfo.getUserData("interceptor");
		if (StringUtils.isNotEmpty(interceptor)) {
			MethodInterceptor interceptorInvoker = getInterceptorInvoker(interceptor);
			if (interceptorInvoker != null) {
				interceptors = new MethodInterceptor[] { interceptorInvoker };
			}
		}
		return interceptors;
	}

	protected abstract MethodInterceptor getInterceptorInvoker(
			String interceptor);

}
