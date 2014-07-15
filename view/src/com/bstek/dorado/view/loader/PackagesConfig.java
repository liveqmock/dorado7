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

package com.bstek.dorado.view.loader;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 用于为JavaScript库和CSS文件按需装载功能提供配置信息的类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Sep 23, 2008
 */
public class PackagesConfig {
	private String contextPath;
	private String defaultContentType;
	private String defaultCharset;
	private Map<String, Pattern> patterns = new LinkedHashMap<String, Pattern>();
	private Map<String, Package> packages = new LinkedHashMap<String, Package>();

	/**
	 * 返回应用的根路径。
	 */
	public String getContextPath() {
		return contextPath;
	}

	/**
	 * 设置应用的根路径。
	 */
	public void setContextPath(String contextPath) {
		this.contextPath = contextPath;
	}

	/**
	 * 返回默认的ContentType。
	 */
	public String getDefaultContentType() {
		return defaultContentType;
	}

	/**
	 * 设置默认的ContentType。
	 */
	public void setDefaultContentType(String defaultContentType) {
		this.defaultContentType = defaultContentType;
	}

	/**
	 * 返回默认的字符集。
	 */
	public String getDefaultCharset() {
		return defaultCharset;
	}

	/**
	 * 设置默认的字符集。
	 */
	public void setDefaultCharset(String defaultCharset) {
		this.defaultCharset = defaultCharset;
	}

	/**
	 * 返回所有的资源样式的Map集合。其中Map集合的键是资源样式的名称，值为资源样式的定义对象。
	 */
	public Map<String, Pattern> getPatterns() {
		return patterns;
	}

	/**
	 * 返回所有资源包的Map集合。其中Map集合的键是资源包的名称，值为资源包的定义对象。
	 */
	public Map<String, Package> getPackages() {
		return packages;
	}
}
