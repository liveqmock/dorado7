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

import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-7-7
 */
public class MethodInterceptorChain {
	private MethodInterceptor[] subMethodInterceptors;
	private int index = 0;
	private MethodInterceptor finalMethodInterceptor;
	private MethodInterceptorFilter filter;

	public MethodInterceptorChain(MethodInterceptor[] subMethodInterceptors,
			MethodInterceptor finalMethodInterceptor,
			MethodInterceptorFilter filter) {
		this.subMethodInterceptors = subMethodInterceptors;
		this.finalMethodInterceptor = finalMethodInterceptor;
		this.filter = filter;
	}

	public MethodInterceptor next(MethodInvocation methodInvocation) {
		MethodInterceptor methodInterceptor = null;
		while (index < subMethodInterceptors.length) {
			methodInterceptor = subMethodInterceptors[index++];
			if (filter != null
					&& !filter.filter(methodInterceptor, methodInvocation)) {
				methodInterceptor = null;
			}
			if (methodInterceptor != null) {
				break;
			}
		}
		if (methodInterceptor == null) {
			methodInterceptor = finalMethodInterceptor;
		}
		return methodInterceptor;
	}
}
