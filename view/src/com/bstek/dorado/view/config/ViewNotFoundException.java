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

package com.bstek.dorado.view.config;

import java.io.IOException;

import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.core.resource.ResourceManager;
import com.bstek.dorado.core.resource.ResourceManagerUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2013-1-12
 */
public class ViewNotFoundException extends IOException {
	private static final long serialVersionUID = -7007869262081740176L;

	private static final ResourceManager resourceManager = ResourceManagerUtils
			.get(ViewNotFoundException.class);

	private String viewName;
	private Resource resource;

	public ViewNotFoundException(String viewName, Resource resource) {
		super(resourceManager.getString("dorado.common/viewNotFoundError",
				viewName, resource.getPath()));
		this.viewName = viewName;
		this.resource = resource;
	}

	public String getViewName() {
		return viewName;
	}

	public Resource getResource() {
		return resource;
	}

}
