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

package com.bstek.dorado.util.proxy;

import java.util.HashMap;
import java.util.Map;

import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-7-27
 */
public class BeanExtenderMethodInterceptor implements MethodInterceptor {

	private Map<String, Object> userDataMap;

	public Object invoke(MethodInvocation methodInvocation) throws Throwable {
		return methodInvocation.proceed();
	}

	/**
	 * @param key
	 * @param data
	 */
	public void setUserData(String key, Object data) {
		if (userDataMap == null) {
			userDataMap = new HashMap<String, Object>();
		}
		userDataMap.put(key, data);
	}

	/**
	 * @param key
	 * @return
	 */
	public Object getUserData(String key) {
		return (userDataMap == null) ? null : userDataMap.get(key);
	}

}
