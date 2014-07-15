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

package com.bstek.dorado.web;

import org.springframework.core.io.ResourceLoader;
import org.springframework.web.context.WebApplicationContext;

import com.bstek.dorado.core.io.BaseResourceLoader;

/**
 * 支持从WEB-INF中读取资源的资源装载装载器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Sep 17, 2008
 */
public class WebResourceLoader extends BaseResourceLoader {
	private WebApplicationContext webApplicationContext;

	public void setWebApplicationContext(
			WebApplicationContext webApplicationContext) {
		this.webApplicationContext = webApplicationContext;
	}

	@Override
	protected ResourceLoader getAdaptee() {
		if (webApplicationContext != null) {
			return webApplicationContext;
		} else {
			return super.getAdaptee();
		}
	}

}
