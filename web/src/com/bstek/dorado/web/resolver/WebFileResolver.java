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

package com.bstek.dorado.web.resolver;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.core.Configure;
import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.util.PathUtils;
import com.bstek.dorado.web.DoradoContext;

/**
 * 用于向客户端输出一个文件的处理器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Sep 24, 2008
 */
public class WebFileResolver extends AbstractWebFileResolver {
	public static final Resource[] EMPTY_RESOURCES = new Resource[0];
	
	private static final String RESOURCE_PREFIX_DELIM = ";,\n\r";

	String baseUri;
	String resourcePrefix;

	/**
	 * 设置URI的根。
	 */
	public void setBaseUri(String baseUri) {
		if (baseUri != null) {
			if (baseUri.charAt(0) == PathUtils.PATH_DELIM) {
				baseUri = baseUri.substring(1);
			}
			if (baseUri.length() > 0
					&& baseUri.charAt(baseUri.length() - 1) != PathUtils.PATH_DELIM) {
				baseUri += PathUtils.PATH_DELIM;
			}
		}
		this.baseUri = baseUri;
	}

	/**
	 * 设置资源路径的前缀。
	 */
	public void setResourcePrefix(String resourcePrefix) {
		this.resourcePrefix = resourcePrefix;
	}

	public String getResourcePrefix() {
		return resourcePrefix;
	}

	@Override
	protected ResourcesWrapper createResourcesWrapper(
			HttpServletRequest request, DoradoContext context) throws Exception {
		String path = getRelativeRequestURI(request);
		if (StringUtils.isNotEmpty(baseUri)) {
			path = path.substring(baseUri.length());
		}

		String resourcePrefix = getResourcePrefix();
		String resourceSuffix = getUriSuffix(request);
		path = path.substring(0, path.length() - resourceSuffix.length());
		Resource[] resources = getResourcesByFileName(context, resourcePrefix,
				path, resourceSuffix);
		return new ResourcesWrapper(resources, getResourceTypeManager()
				.getResourceType(resourceSuffix));
	}

	protected Resource[] getResourcesByFileName(DoradoContext context,
			String resourcePrefix, String fileName, String resourceSuffix)
			throws Exception {
		String path;
		Resource[] resources = null;
		if ("debug".equals(Configure.getString("core.runMode"))
				&& resourcePrefix != null
				&& StringUtils
						.indexOfAny(resourcePrefix, RESOURCE_PREFIX_DELIM) >= 0) {
			String[] prefixs = StringUtils.split(resourcePrefix,
					RESOURCE_PREFIX_DELIM);
			for (String prefix : prefixs) {
				boolean allExists = true;
				path = PathUtils.concatPath(prefix, fileName);
				if (resourceSuffix != null) {
					path = path + resourceSuffix;
				}
				resources = context.getResources(path);
				if (resources != null && resources.length > 0) {
					for (int i = 0; i < resources.length; i++) {
						Resource resource = resources[i];
						if (!resource.exists()) {
							allExists = false;
							break;
						}
					}
				}
				if (allExists) {
					break;
				}
			}
		} else {
			path = PathUtils.concatPath(resourcePrefix, fileName);
			if (resourceSuffix != null) {
				path = path + resourceSuffix;
			}
			resources = context.getResources(path);
		}
		return resources;
	}
}
