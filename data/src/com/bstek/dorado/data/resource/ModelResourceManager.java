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

package com.bstek.dorado.data.resource;

import java.util.Locale;

import com.bstek.dorado.config.definition.Definition;
import com.bstek.dorado.core.resource.AbstractResourceManagerSupport;
import com.bstek.dorado.core.resource.ResourceBundle;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-5-6
 */
public class ModelResourceManager extends AbstractResourceManagerSupport {
	private ModelResourceBundleManager modelResourceBundleManager;

	public void setModelResourceBundleManager(
			ModelResourceBundleManager modelResourceBundleManager) {
		this.modelResourceBundleManager = modelResourceBundleManager;
	}

	public ResourceBundle getBundle(Definition definition) throws Exception {
		Locale locale = getLocale();
		return modelResourceBundleManager.getBundle(definition, locale);
	}

	public String getString(Definition definition, String path, Object... args)
			throws Exception {
		String result = null;
		Locale locale = getLocale();
		ResourceBundle bundle = modelResourceBundleManager.getBundle(
				definition, locale);
		if (bundle != null) {
			result = bundle.getString(path, args);
		}
		if (result == null) {
			result = getString(locale, path, args);
		}
		return result;
	}
}
