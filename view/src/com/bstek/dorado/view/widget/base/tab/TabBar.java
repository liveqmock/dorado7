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

package com.bstek.dorado.view.widget.base.tab;

import java.util.List;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.XmlSubNode;
import com.bstek.dorado.view.annotation.Widget;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-11-4
 */
@Widget(name = "TabBar", category = "General", dependsPackage = "base-widget-desktop")
@ClientObject(prototype = "dorado.widget.TabBar", shortTypeName = "TabBar")
public class TabBar extends AbstractTabControl {
	private TabPlacement tabPlacement = TabPlacement.top;
	private boolean showMenuButton;
	private int tabMinWidth;

	@XmlSubNode(implTypes = "com.bstek.dorado.view.widget.base.tab.Tab")
	@ClientProperty
	public List<Tab> getTabs() {
		return super.getTabs();
	}

	@ClientProperty(escapeValue = "top")
	public TabPlacement getTabPlacement() {
		return tabPlacement;
	}

	public void setTabPlacement(TabPlacement tabPlacement) {
		this.tabPlacement = tabPlacement;
	}

	public boolean isShowMenuButton() {
		return showMenuButton;
	}

	public void setShowMenuButton(boolean showMenuButton) {
		this.showMenuButton = showMenuButton;
	}

	public int getTabMinWidth() {
		return tabMinWidth;
	}

	public void setTabMinWidth(int tabMinWidth) {
		this.tabMinWidth = tabMinWidth;
	}

}
