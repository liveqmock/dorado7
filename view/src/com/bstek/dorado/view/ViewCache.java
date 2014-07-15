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

package com.bstek.dorado.view;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2013-10-29
 */
public class ViewCache {
	private ViewCacheMode mode = ViewCacheMode.none;
	private long maxAge;

	public ViewCacheMode getMode() {
		return mode;
	}

	public void setMode(ViewCacheMode mode) {
		this.mode = mode;
	}

	public long getMaxAge() {
		return maxAge;
	}

	public void setMaxAge(long maxAge) {
		this.maxAge = maxAge;
	}
}
