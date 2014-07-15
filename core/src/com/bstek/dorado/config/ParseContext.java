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

package com.bstek.dorado.config;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import com.bstek.dorado.core.io.Resource;

/**
 * 解析配置文件时使用的上下文对象。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 20, 2007
 * @see com.bstek.dorado.core.io.Resource
 */
public class ParseContext {
	private Resource resource;
	private Set<Resource> dependentResources = new HashSet<Resource>();
	private Map<String, Object> attributes = new HashMap<String, Object>();

	/**
	 * 返回当前解析的配置文件的资源描述对象。
	 */
	public Resource getResource() {
		return resource;
	}

	/**
	 * 设置当前解析的配置文件的资源描述对象。
	 */
	public void setResource(Resource resource) {
		this.resource = resource;
	}

	/**
	 * @return
	 */
	public Set<Resource> getDependentResources() {
		return dependentResources;
	}

	/**
	 * 返回与此上下文关联的一组属性。
	 */
	public Map<String, Object> getAttributes() {
		return attributes;
	}

}
