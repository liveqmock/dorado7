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

package com.bstek.dorado.view.widget.base.toolbar;

import java.util.List;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.XmlSubNode;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.Control;
import com.bstek.dorado.view.widget.InnerElementList;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-8-9
 */
@Widget(name = "ToolBar", category = "General", dependsPackage = "base-widget-desktop")
@ClientObject(prototype = "dorado.widget.ToolBar", shortTypeName = "ToolBar")
public class ToolBar extends Control {
	private List<Control> items = new InnerElementList<Control>(this);
	private boolean fixRight;
	private boolean showMenuOnHover;

	public void addItem(Control item) {
		items.add(item);
	}

	@XmlSubNode(implTypes = "com.bstek.dorado.view.widget.base.toolbar.*")
	@ClientProperty
	public List<Control> getItems() {
		return items;
	}

	@ClientProperty(escapeValue = "false")
	public boolean isShowMenuOnHover() {
		return showMenuOnHover;
	}

	public boolean isFixRight() {
		return fixRight;
	}

	public void setFixRight(boolean fixRight) {
		this.fixRight = fixRight;
	}

	public void setShowMenuOnHover(boolean showMenuOnHover) {
		this.showMenuOnHover = showMenuOnHover;
	}

}
