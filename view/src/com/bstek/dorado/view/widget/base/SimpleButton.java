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

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.view.annotation.Widget;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-8-1
 */
@Widget(name = "SimpleButton", category = "General",
		dependsPackage = "base-widget")
@ClientObject(prototype = "dorado.widget.SimpleButton",
		shortTypeName = "SimpleButton")
@XmlNode(clientTypes = { ClientType.DESKTOP, ClientType.TOUCH })
public class SimpleButton extends AbstractButton {
	private String mouseDownClassName;
	private String hoverClassName;
	private String toggledClassName;
	private String disabledClassName;

	public String getMouseDownClassName() {
		return mouseDownClassName;
	}

	public void setMouseDownClassName(String mouseDownClassName) {
		this.mouseDownClassName = mouseDownClassName;
	}

	public String getHoverClassName() {
		return hoverClassName;
	}

	public void setHoverClassName(String hoverClassName) {
		this.hoverClassName = hoverClassName;
	}

	public String getToggledClassName() {
		return toggledClassName;
	}

	public void setToggledClassName(String toggledClassName) {
		this.toggledClassName = toggledClassName;
	}

	public String getDisabledClassName() {
		return disabledClassName;
	}

	public void setDisabledClassName(String disabledClassName) {
		this.disabledClassName = disabledClassName;
	}
}
