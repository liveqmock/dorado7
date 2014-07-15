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

package com.bstek.dorado.view.widget.form.trigger;

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.Component;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-8-20
 */
@Widget(name = "Trigger", category = "Trigger", dependsPackage = "base-widget",
		autoGenerateId = true)
@ClientObject(prototype = "dorado.widget.Trigger", shortTypeName = "Trigger")
@ClientEvents({ @ClientEvent(name = "beforeExecute"),
		@ClientEvent(name = "onExecute") })
public class Trigger extends Component {
	private String icon;
	private String iconClass;
	private boolean editable = true;
	private boolean buttonVisible = true;

	public String getIcon() {
		return icon;
	}

	public void setIcon(String icon) {
		this.icon = icon;
	}

	@IdeProperty(
			enumValues = "d-trigger-icon-drop,d-trigger-icon-search,d-trigger-icon-date,d-trigger-icon-custom")
	public String getIconClass() {
		return iconClass;
	}

	public void setIconClass(String iconClass) {
		this.iconClass = iconClass;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isEditable() {
		return editable;
	}

	public void setEditable(boolean editable) {
		this.editable = editable;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isButtonVisible() {
		return buttonVisible;
	}

	public void setButtonVisible(boolean buttonVisible) {
		this.buttonVisible = buttonVisible;
	}

}
