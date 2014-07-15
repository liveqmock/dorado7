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

import org.apache.commons.lang.RandomStringUtils;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.annotation.XmlSubNode;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.InnerElementReference;
import com.bstek.dorado.view.widget.base.menu.BaseMenuItem;
import com.bstek.dorado.view.widget.base.menu.Menu;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-8-8
 */
@Widget(name = "MenuButton", category = "ToolBar")
@ClientObject(prototype = "dorado.widget.toolbar.ToolBarButton", shortTypeName = "ToolBarButton")
@XmlNode(nodeName = "MenuButton")
public class MenuButton extends com.bstek.dorado.view.widget.base.Button {
	private InnerElementReference<Menu> embededMenuRef = new InnerElementReference<Menu>(
			this);
	private boolean showMenuOnHover;
	private boolean hideMenuOnMouseLeave = false;
	private int hideMenuOnMouseLeaveDelay = 300;

	protected Menu getEmbededMenu(boolean create) {
		Menu menu = embededMenuRef.get();
		if (menu == null && create) {
			String menuId = RandomStringUtils.randomAlphanumeric(16);
			menu = new Menu();
			menu.setId(menuId);
			embededMenuRef.set(menu);
			super.setMenu(menuId);
		}
		return menu;
	}

	public void addItem(BaseMenuItem menuItem) {
		getEmbededMenu(true).addItem(menuItem);
	}

	@XmlSubNode
	@ClientProperty
	public List<BaseMenuItem> getItems() {
		Menu menu = getEmbededMenu(false);
		return (menu != null) ? menu.getItems() : null;
	}

	public void setItems(List<BaseMenuItem> items) {
		Menu menu = getEmbededMenu(false);
		if (menu != null) {
			menu.getItems().clear();
		}

		if (items != null && !items.isEmpty()) {
			for (BaseMenuItem item : items) {
				addItem(item);
			}
		}
	}

	@Override
	@XmlProperty(deprecated = true, ignored = true)
	@IdeProperty(visible = false)
	public String getMenu() {
		return null;
	}

	@Override
	public void setMenu(String menu) {
		throw new UnsupportedOperationException();
	}

	@ClientProperty(escapeValue = "false")
	public boolean isShowMenuOnHover() {
		return showMenuOnHover;
	}

	public void setShowMenuOnHover(boolean showMenuOnHover) {
		this.showMenuOnHover = showMenuOnHover;
	}

	public boolean isHideMenuOnMouseLeave() {
		return hideMenuOnMouseLeave;
	}

	public void setHideMenuOnMouseLeave(boolean hideMenuOnMouseLeave) {
		this.hideMenuOnMouseLeave = hideMenuOnMouseLeave;
	}

	@ClientProperty(escapeValue = "300")
	public int getHideMenuOnMouseLeaveDelay() {
		return hideMenuOnMouseLeaveDelay;
	}

	public void setHideMenuOnMouseLeaveDelay(int hideMenuOnMouseLeaveDelay) {
		this.hideMenuOnMouseLeaveDelay = hideMenuOnMouseLeaveDelay;
	}
}
