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

package com.bstek.dorado.view.resolver;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.springframework.web.servlet.ModelAndView;

import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.util.PathUtils;
import com.bstek.dorado.web.DoradoContext;
import com.bstek.dorado.web.WebConfigure;
import com.bstek.dorado.web.resolver.HttpConstants;
import com.bstek.dorado.web.resolver.WebFileResolver;

/**
 * 用于向客户端输出一个皮肤文件的处理器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Sep 28, 2008
 */
public class SkinFileResolver extends WebFileResolver {
	private static final String SKIN_URI_PREFIX = "skins/";
	private static final String DEFAULT_SKIN = "default";

	public SkinFileResolver() {
		setUseResourcesCache(true);
		setCheckResourceType(true);
	}

	@Override
	protected Resource[] getResourcesByFileName(DoradoContext context,
			String resourcePrefix, String fileName, String resourceSuffix)
			throws Exception {
		if (!PathUtils.isSafePath(fileName)) {
			throw new IllegalAccessException("Request ["
					+ context.getRequest().getRequestURI() + "] forbidden.");
		}

		String originFileName = fileName, skin, subPath;
		int i = originFileName.indexOf(SKIN_URI_PREFIX);
		if (i >= 0) {
			subPath = originFileName.substring(i + SKIN_URI_PREFIX.length());
			i = subPath.indexOf(PathUtils.PATH_DELIM);
			if (i > 0) {
				skin = subPath.substring(0, i);
				subPath = subPath.substring(i + 1);

				Resource[] resources;
				String customSkinPath = WebConfigure.getString("view.skin."
						+ skin);
				if (StringUtils.isNotEmpty(customSkinPath)) {
					resources = super.getResourcesByFileName(context,
							customSkinPath, subPath, resourceSuffix);
				} else {
					resources = super.getResourcesByFileName(context,
							resourcePrefix, originFileName, resourceSuffix);
				}
				if (!skin.equals(DEFAULT_SKIN) && !resources[0].exists()) {
					subPath = PathUtils.concatPath(SKIN_URI_PREFIX,
							DEFAULT_SKIN, subPath);
					resources = super.getResourcesByFileName(context,
							resourcePrefix, subPath, resourceSuffix);
				}
				return resources;
			}
		}
		return EMPTY_RESOURCES;
	}

	@Override
	protected ModelAndView doHandleRequest(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		response.addHeader(HttpConstants.CACHE_CONTROL, HttpConstants.MAX_AGE
				+ WebConfigure.getLong("web.resourceMaxAge", 3600));
		return super.doHandleRequest(request, response);
	}
}
