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

import net.sf.ehcache.Ehcache;
import net.sf.ehcache.Element;

import org.apache.commons.collections.keyvalue.MultiKey;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-5-5
 */
public abstract class GlobalResourceBundleManagerSupport implements
		GlobalResourceBundleManager {
	private Ehcache cache;

	public void setCache(Ehcache cache) {
		this.cache = cache;
	}

	protected abstract ResourceBundle doGetBundle(String bundleName,
			Locale locale) throws Exception;

	public ResourceBundle getBundle(String bundleName, Locale locale)
			throws Exception {
		Object cacheKey = new MultiKey(bundleName, locale);
		synchronized (cache) {
			Element element = cache.get(cacheKey);
			if (element == null) {
				ResourceBundle bundle = doGetBundle(bundleName, locale);
				element = new Element(cacheKey, bundle);
				cache.put(element);
			}
			return (ResourceBundle) element.getObjectValue();
		}
	}
}
