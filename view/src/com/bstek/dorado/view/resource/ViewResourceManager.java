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

package com.bstek.dorado.view.resource;

import java.util.Locale;

import com.bstek.dorado.core.resource.AbstractResourceManagerSupport;
import com.bstek.dorado.core.resource.ResourceBundle;
import com.bstek.dorado.view.config.definition.ViewConfigDefinition;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-5-6
 */
public class ViewResourceManager extends AbstractResourceManagerSupport {
	private ViewResourceBundleManager viewResourceBundleManager;

	public void setViewResourceBundleManager(
			ViewResourceBundleManager viewResourceBundleManager) {
		this.viewResourceBundleManager = viewResourceBundleManager;
	}

	protected ResourceBundle getBundle(
			ViewConfigDefinition viewConfigDefinition, Locale locale)
			throws Exception {
		return viewResourceBundleManager
				.getBundle(viewConfigDefinition, locale);
	}

	public ResourceBundle getBundle(ViewConfigDefinition viewConfigDefinition)
			throws Exception {
		Locale locale = getLocale();
		return getBundle(viewConfigDefinition, locale);
	}

	public String getString(ViewConfigDefinition viewConfigDefinition,
			String path, Object... args) throws Exception {
		Locale locale = getLocale();
		String result = null;
		ResourceBundle bundle = getBundle(viewConfigDefinition, locale);
		if (bundle != null) {
			result = bundle.getString(path, args);
		}
		if (result == null) {
			result = getString(locale, path, args);
		}
		return result;
	}
}
