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

package com.bstek.dorado.view.widget.base.menu;

import java.util.Collections;
import java.util.List;

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.ResourceInjection;
import com.bstek.dorado.common.event.ClientEventSupported;
import com.bstek.dorado.view.annotation.ComponentReference;
import com.bstek.dorado.view.widget.action.ActionSupport;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-11-4
 */
@ClientEvents({ @ClientEvent(name = "onClick") })
@ResourceInjection(subObjectMethod = "getItem")
public abstract class TextMenuItem extends BaseMenuItem implements
		ActionSupport, ClientEventSupported {
	private String caption;
	private String icon;
	private String iconClass;
	private String action;
	private boolean disabled;
	private boolean hideOnClick = true;

	public String getCaption() {
		return caption;
	}

	public void setCaption(String caption) {
		this.caption = caption;
	}

	public String getIcon() {
		return icon;
	}

	public void setIcon(String icon) {
		this.icon = icon;
	}

	public String getIconClass() {
		return iconClass;
	}

	public void setIconClass(String iconClass) {
		this.iconClass = iconClass;
	}

	@ComponentReference("Action")
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

	@ClientProperty(escapeValue = "true")
	public boolean isHideOnClick() {
		return hideOnClick;
	}

	public void setHideOnClick(boolean hideOnClick) {
		this.hideOnClick = hideOnClick;
	}

	@Deprecated
	@SuppressWarnings("unchecked")
	public List<BaseMenuItem> getItems() {
		return Collections.EMPTY_LIST;
	}

}
