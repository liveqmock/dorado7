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

import com.bstek.dorado.annotation.ClientProperty;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-7-20
 */
public abstract class AbstractBoxLayout extends Layout {
	private Pack pack = Pack.start;
	private boolean stretch = true;
	private int padding = 2;
	private int regionPadding = 2;

	@ClientProperty(escapeValue = "start")
	public Pack getPack() {
		return pack;
	}

	public void setPack(Pack pack) {
		this.pack = pack;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isStretch() {
		return stretch;
	}

	public void setStretch(boolean stretch) {
		this.stretch = stretch;
	}

	@Override
	@ClientProperty(escapeValue = "2")
	public int getPadding() {
		return padding;
	}

	@Override
	public void setPadding(int padding) {
		this.padding = padding;
	}

	@ClientProperty(escapeValue = "2")
	public int getRegionPadding() {
		return regionPadding;
	}

	public void setRegionPadding(int regionPadding) {
		this.regionPadding = regionPadding;
	}

}
