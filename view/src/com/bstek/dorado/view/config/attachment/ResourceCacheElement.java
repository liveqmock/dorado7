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

package com.bstek.dorado.view.config.attachment;

import java.io.IOException;

import net.sf.ehcache.Element;

import com.bstek.dorado.core.io.RefreshableResource;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-5-29
 */
public class ResourceCacheElement extends Element {
	private static final long serialVersionUID = -4363610522391395305L;

	public ResourceCacheElement(RefreshableResource resource, Object value)
			throws IOException {
		super(resource, value);
	}

	@Override
	public boolean isExpired() {
		if (super.isExpired()) {
			return true;
		}

		RefreshableResource resource = (RefreshableResource) getObjectKey();
		if (resource != null) {
			return !resource.isValid();
		} else {
			return false;
		}
	}
}
