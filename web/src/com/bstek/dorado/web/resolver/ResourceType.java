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

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-1-23
 */
public class ResourceType {
	private String type;
	private String contentType;
	private boolean compressible;

	public ResourceType(String type, String contentType, boolean compressible) {
		this.type = type;
		this.contentType = contentType;
		this.compressible = compressible;
	}

	public String getType() {
		return type;
	}

	public String getContentType() {
		return contentType;
	}

	public boolean isCompressible() {
		return compressible;
	}
}
