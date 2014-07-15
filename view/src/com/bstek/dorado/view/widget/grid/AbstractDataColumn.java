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

package com.bstek.dorado.view.widget.grid;

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientProperty;

@ClientEvents({ @ClientEvent(name = "onRenderCell"),
		@ClientEvent(name = "onRenderFooterCell") })
public abstract class AbstractDataColumn extends Column {
	private String width;
	private String renderer;
	private String footerRenderer;
	private String filterBarRenderer;
	private boolean resizeable = true;

	public String getRenderer() {
		return renderer;
	}

	public void setRenderer(String renderer) {
		this.renderer = renderer;
	}

	public String getFooterRenderer() {
		return footerRenderer;
	}

	public void setFooterRenderer(String footerRenderer) {
		this.footerRenderer = footerRenderer;
	}

	public String getFilterBarRenderer() {
		return filterBarRenderer;
	}

	public void setFilterBarRenderer(String filterBarRenderer) {
		this.filterBarRenderer = filterBarRenderer;
	}

	public String getWidth() {
		return width;
	}

	public void setWidth(String width) {
		this.width = width;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isResizeable() {
		return resizeable;
	}

	public void setResizeable(boolean resizeable) {
		this.resizeable = resizeable;
	}

}
