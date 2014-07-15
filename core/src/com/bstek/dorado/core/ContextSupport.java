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

package com.bstek.dorado.core;

import java.io.IOException;

import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.core.io.ResourceLoader;

/**
 * 实现了上下文属性的维护和资源读取功能的上下文抽象支持类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 19, 2007
 * @see com.bstek.dorado.core.io.Resource
 * @see com.bstek.dorado.core.io.ResourceLoader
 */
public abstract class ContextSupport extends Context {
	protected abstract ResourceLoader getResourceLoader();

	@Override
	public Resource getResource(String resourceLocation) {
		return getResourceLoader().getResource(resourceLocation);
	}

	@Override
	public Resource[] getResources(String locationPattern) throws IOException {
		return getResourceLoader().getResources(locationPattern);
	}

	@Override
	public ClassLoader getClassLoader() {
		return getResourceLoader().getClassLoader();
	}

}
