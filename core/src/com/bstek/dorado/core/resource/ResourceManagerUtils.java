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

package com.bstek.dorado.core.resource;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.core.ApplicationContextNotInitException;
import com.bstek.dorado.core.Context;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-5-10
 */
public class ResourceManagerUtils {
	public static ResourceManager get(String bundleName) {
		ResourceManager resourceManager;
		try {
			resourceManager = (ResourceManager) Context.getCurrent()
					.getServiceBean("resourceManager");
		} catch (ApplicationContextNotInitException e) {
			resourceManager = new LazyInitResourceManager();
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
		resourceManager.init(bundleName);
		return resourceManager;
	}

	public static ResourceManager get(Class<?> bindingType) {
		return get(bindingType.getName());
	}
}

class LazyInitResourceManager implements ResourceManager {
	private static final Log logger = LogFactory
			.getLog(LazyInitResourceManager.class);

	private String bundleName;
	private ResourceManager resourceManager;

	public void init(String bundleName) {
		this.bundleName = bundleName;
	}

	private ResourceManager getResourceManager() throws Exception {
		if (resourceManager == null) {
			resourceManager = (ResourceManager) Context.getCurrent()
					.getServiceBean("resourceManager");
			resourceManager.init(bundleName);
		}
		return resourceManager;
	}

	public ResourceBundle getBundle() throws Exception {
		return getResourceManager().getBundle();
	}

	public String getString(String path, Object... args) {
		try {
			return getResourceManager().getString(path, args);
		} catch (Exception e) {
			logger.error(e, e);
			return null;
		}
	}

}
