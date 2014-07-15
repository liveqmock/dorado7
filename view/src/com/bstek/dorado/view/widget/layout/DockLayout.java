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

package com.bstek.dorado.view.widget.layout;

import com.bstek.dorado.annotation.ClientObject;

/**
 * Border型布局管理器。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 5, 2008
 */
@ClientObject(shortTypeName = "Dock")
public class DockLayout extends Layout {
	private int regionPadding;

	public int getRegionPadding() {
		return regionPadding;
	}

	public void setRegionPadding(int regionPadding) {
		this.regionPadding = regionPadding;
	}
}
