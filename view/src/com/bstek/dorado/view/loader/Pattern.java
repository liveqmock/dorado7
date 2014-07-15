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

import com.bstek.dorado.core.Constants;

/**
 * 资源样式。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Sep 24, 2008
 */
public class Pattern {
	private String name;
	private String contentType;
	private String charset = Constants.DEFAULT_CHARSET;
	private boolean mergeRequests;
	private String baseUri = ">";
	private String resourcePrefix = null;
	private String resourceSuffix = null;

	/**
	 * @param name
	 *            样式的名称。
	 */
	public Pattern(String name) {
		this.name = name;
	}

	/**
	 * 返回样式的名称。
	 */
	public String getName() {
		return name;
	}

	/**
	 * 返回ContentType。
	 */
	public String getContentType() {
		return contentType;
	}

	/**
	 * 设置ContentType。
	 */
	public void setContentType(String contentType) {
		this.contentType = contentType;
	}

	/**
	 * 返回字符集。
	 */
	public String getCharset() {
		return charset;
	}

	/**
	 * 设置字符集。
	 */
	public void setCharset(String charset) {
		this.charset = charset;
	}

	/**
	 * 是否要将引用此资源路径的、相邻的各个资源包合并成为一个Http请求。
	 */
	public boolean isMergeRequests() {
		return mergeRequests;
	}

	/**
	 * 设置是否要将引用此资源路径的、相邻的各个资源包合并成为一个Http请求。
	 */
	public void setMergeRequests(boolean mergeRequests) {
		this.mergeRequests = mergeRequests;
	}

	public String getBaseUri() {
		return baseUri;
	}

	public void setBaseUri(String baseUri) {
		this.baseUri = baseUri;
	}

	public String getResourcePrefix() {
		return resourcePrefix;
	}

	public void setResourcePrefix(String resourcePrefix) {
		this.resourcePrefix = resourcePrefix;
	}

	public String getResourceSuffix() {
		return resourceSuffix;
	}

	public void setResourceSuffix(String resourceSuffix) {
		this.resourceSuffix = resourceSuffix;
	}

}
