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

package com.bstek.dorado.view.widget.base;

import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.view.annotation.ComponentReference;
import com.bstek.dorado.view.widget.Control;
import com.bstek.dorado.view.widget.action.ActionSupport;

public abstract class AbstractButton extends Control implements ActionSupport {
	private String action;
	private boolean disabled;
	private boolean toggleable;
	private boolean toggled;
	private String menu;
	private boolean toggleOnShowMenu = true;

	@ComponentReference("Action")
	@IdeProperty(highlight = 1)
	public String getAction() {
		return action;
	}

	public void setAction(String action) {
		this.action = action;
	}

	public boolean isDisabled() {
		return disabled;
	}

	public void setDisabled(boolean disabled) {
		this.disabled = disabled;
	}

	public boolean isToggleable() {
		return toggleable;
	}

	public void setToggleable(boolean toggleable) {
		this.toggleable = toggleable;
	}

	public boolean isToggled() {
		return toggled;
	}

	public void setToggled(boolean toggled) {
		this.toggled = toggled;
	}

	@ComponentReference("Menu")
	public String getMenu() {
		return menu;
	}

	public void setMenu(String menu) {
		this.menu = menu;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isToggleOnShowMenu() {
		return toggleOnShowMenu;
	}

	public void setToggleOnShowMenu(boolean toggleOnShowMenu) {
		this.toggleOnShowMenu = toggleOnShowMenu;
	}

}
