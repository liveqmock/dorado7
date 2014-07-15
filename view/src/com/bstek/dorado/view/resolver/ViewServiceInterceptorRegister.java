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

package com.bstek.dorado.view.resolver;

import org.aopalliance.intercept.MethodInterceptor;
import org.springframework.beans.factory.InitializingBean;

import com.bstek.dorado.spring.RemovableBean;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-7-7
 */
public class ViewServiceInterceptorRegister implements InitializingBean,
		RemovableBean {
	private ViewServiceResolver viewServiceResolver;
	private MethodInterceptor methodInterceptor;

	public void setViewServiceResolver(ViewServiceResolver viewServiceResolver) {
		this.viewServiceResolver = viewServiceResolver;
	}

	public void setMethodInterceptor(MethodInterceptor methodInterceptor) {
		this.methodInterceptor = methodInterceptor;
	}

	public void afterPropertiesSet() throws Exception {
		if (methodInterceptor != null) {
			viewServiceResolver.addMethodInterceptor(methodInterceptor);
		}
	}
}
