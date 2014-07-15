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

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.view.annotation.Widget;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-8-9
 */
@Widget(category = "ToolBar", dependsPackage = "base-widget")
@ClientObject(prototype = "dorado.widget.toolbar.ToolBarButton", shortTypeName = "ToolBarButton")
@XmlNode(nodeName = "ToolBarButton", label = "ToolBarButton")
public class Button extends com.bstek.dorado.view.widget.base.Button {
	private boolean showMenuOnHover;
	private boolean hideMenuOnMouseLeave = false;
	private int hideMenuOnMouseLeaveDelay = 300;

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
