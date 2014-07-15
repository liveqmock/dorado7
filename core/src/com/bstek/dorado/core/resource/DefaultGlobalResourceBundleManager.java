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

import java.io.InputStream;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Properties;
import java.util.Set;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.core.io.ResourceUtils;
import com.bstek.dorado.util.PathUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-5-5
 */
public class DefaultGlobalResourceBundleManager extends
		GlobalResourceBundleManagerSupport {
	private static final String RESOURCE_FILE_SUFFIX = ".properties";

	private Set<String> searchPaths = new LinkedHashSet<String>();

	public void setSearchPaths(Collection<String> searchPaths) {
		addSearchPaths(searchPaths);
	}

	public Collection<String> getSearchPaths() {
		return searchPaths;
	}

	public void addSearchPaths(Collection<String> searchPaths) {
		this.searchPaths.addAll(searchPaths);
	}

	public void addSearchPath(String searchPath) {
		this.searchPaths.add(searchPath);
	}

	@Override
	protected ResourceBundle doGetBundle(String bundleName, Locale locale)
			throws Exception {
		ResourceBundle bundle = null;
		Resource resource = findResource(bundleName, locale);
		if (resource != null) {
			InputStream in = resource.getInputStream();
			try {
				Properties properties = new Properties();
				properties.load(in);
				bundle = new DefaultResourceBundle(properties);
			} finally {
				in.close();
			}
		}
		// else {
		// throw new FileNotFoundException(
		// "Can not found resource file for \"" + bundleName
		// + "\" in all search paths.");
		// }
		return bundle;
	}

	protected Resource findResource(String bundleName, Locale locale)
			throws Exception {
		for (String searchPath : searchPaths) {
			Resource resource = findResourceInPath(searchPath, bundleName,
					locale);
			if (resource != null && resource.exists()) {
				return resource;
			}
		}
		return null;
	}

	protected Resource findResourceInPath(String searchPath, String bundleName,
			Locale locale) throws Exception {
		Resource resource = null;

		bundleName = StringUtils.replace(bundleName, ".", "/");
		String path = PathUtils.concatPath(searchPath, bundleName);
		if (locale != null) {
			String localeSuffix = '.' + locale.toString();
			resource = ResourceUtils.getResource(path + localeSuffix
					+ RESOURCE_FILE_SUFFIX);
			if (resource != null && resource.exists()) {
				return resource;
			}
		}

		resource = ResourceUtils.getResource(path + RESOURCE_FILE_SUFFIX);
		if (resource != null && resource.exists()) {
			return resource;
		}

		return null;
	}
}
