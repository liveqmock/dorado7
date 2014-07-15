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

import org.springframework.beans.factory.InitializingBean;

import com.bstek.dorado.spring.RemovableBean;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-12-31
 */
public class ViewResolverListenerRegister implements InitializingBean,
		RemovableBean {
	private HtmlViewResolver viewResolver;
	private ViewResolverListener listener;

	public void setViewResolver(HtmlViewResolver viewResolver) {
		this.viewResolver = viewResolver;
	}

	public void setListener(ViewResolverListener listener) {
		this.listener = listener;
	}

	public void afterPropertiesSet() throws Exception {
		if (listener != null) {
			viewResolver.addViewResolverListener(listener);
		}
	}

}
