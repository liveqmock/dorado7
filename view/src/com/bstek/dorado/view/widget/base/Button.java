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

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.view.annotation.Widget;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 16, 2009
 */
@Widget(name = "Button", category = "General", dependsPackage = "base-widget-desktop")
@ClientObject(prototype = "dorado.widget.Button", shortTypeName = "Button")
@ClientEvents({ @ClientEvent(name = "onTriggerClick") })
public class Button extends AbstractButton {
	private String caption;
	private String icon;
	private String iconClass;
	private boolean triggerToggled;
	private boolean showTrigger;
	private boolean splitButton;

	@IdeProperty(highlight = 1)
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

	public boolean isTriggerToggled() {
		return triggerToggled;
	}

	public void setTriggerToggled(boolean triggerToggled) {
		this.triggerToggled = triggerToggled;
	}

	public boolean getShowTrigger() {
		return showTrigger;
	}

	public void setShowTrigger(boolean showTrigger) {
		this.showTrigger = showTrigger;
	}

	public boolean getSplitButton() {
		return splitButton;
	}

	public void setSplitButton(boolean splitButton) {
		this.splitButton = splitButton;
	}

}
