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

import java.util.Locale;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-5-5
 */
public abstract class AbstractResourceManagerSupport {
	private static final Log logger = LogFactory
			.getLog(AbstractResourceManagerSupport.class);
	private static final String DEFUALT_BUNDLE_NAME = "Default";

	private GlobalResourceBundleManager globalResourceBundleManager;
	private LocaleResolver localeResolver;
	private Locale defaultLocale;

	public void setGlobalResourceBundleManager(
			GlobalResourceBundleManager globalResourceBundleManager) {
		this.globalResourceBundleManager = globalResourceBundleManager;
	}

	/**
	 * 设置用于确定国际化区域、语种信息的处理器。
	 */
	public void setLocaleResolver(LocaleResolver localeResolver) {
		this.localeResolver = localeResolver;
	}

	public Locale getDefaultLocale() {
		return defaultLocale;
	}

	public void setDefaultLocale(Locale defaultLocale) {
		this.defaultLocale = defaultLocale;
	}

	protected Locale getLocale() throws Exception {
		Locale locale = null;
		if (localeResolver != null) {
			locale = localeResolver.resolveLocale();
		}
		return (locale != null) ? locale : defaultLocale;
	}

	protected String getString(Locale locale, String path, Object... args) {
		try {
			String bundleName, key;
			int i = path.indexOf('/');
			if (i > 0) {
				bundleName = path.substring(0, i);
				key = path.substring(i + 1);
			} else {
				bundleName = DEFUALT_BUNDLE_NAME;
				key = path;
			}

			ResourceBundle bundle = globalResourceBundleManager.getBundle(
					bundleName, locale);
			return (bundle != null) ? bundle.getString(key, args) : null;
		} catch (Exception e) {
			logger.error(e, e);
			return null;
		}
	}
}
