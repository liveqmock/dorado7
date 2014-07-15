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
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.view.ClientEventSupportedElement;
import com.bstek.dorado.view.widget.Align;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-9-28
 */
@ClientEvents({ @ClientEvent(name = "onRenderHeaderCell"),
		@ClientEvent(name = "onHeaderClick"),
		@ClientEvent(name = "onGetCellEditor") })
@XmlNode(implTypes = "com.bstek.dorado.view.widget.grid.*")
public abstract class Column extends ClientEventSupportedElement {
	private String name;
	private String caption;
	private Align align;
	private Align headerAlign = Align.center;
	private String headerRenderer;
	private boolean visible = true;
	private boolean supportsOptionMenu = true;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getCaption() {
		return caption;
	}

	public void setCaption(String caption) {
		this.caption = caption;
	}

	public Align getAlign() {
		return align;
	}

	public void setAlign(Align align) {
		this.align = align;
	}

	@ClientProperty(escapeValue = "center")
	public Align getHeaderAlign() {
		return headerAlign;
	}

	public void setHeaderAlign(Align headerAlign) {
		this.headerAlign = headerAlign;
	}

	public String getHeaderRenderer() {
		return headerRenderer;
	}

	public void setHeaderRenderer(String headerRenderer) {
		this.headerRenderer = headerRenderer;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isVisible() {
		return visible;
	}

	public void setVisible(boolean visible) {
		this.visible = visible;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isSupportsOptionMenu() {
		return supportsOptionMenu;
	}

	public void setSupportsOptionMenu(boolean supportsOptionMenu) {
		this.supportsOptionMenu = supportsOptionMenu;
	}
}
