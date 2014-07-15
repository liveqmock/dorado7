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

package com.bstek.dorado.core.io;

import org.springframework.core.io.ResourceLoader;

/**
 * 资源装载类的基本实现。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 9, 2007
 */
public class BaseResourceLoader extends SpringResourceLoaderAdapter {
	private org.springframework.core.io.ResourceLoader springResourceLoader;

	@Override
	protected ResourceLoader getAdaptee() {
		if (springResourceLoader == null) {
			springResourceLoader = new org.springframework.core.io.DefaultResourceLoader();
		}
		return springResourceLoader;
	}

	@Override
	protected String transformLocation(String location) {
		location = LocationTransformerHolder.transformLocation(location);
		return super.transformLocation(location);
	}
}
