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

package com.bstek.dorado.view.widget.action;

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.Component;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since May 13, 2009
 */
@Widget(name = "Action", category = "Action", dependsPackage = "base-widget", autoGenerateId = true)
@ClientObject(prototype = "dorado.widget.Action", shortTypeName = "Action")
@ClientEvents({ @ClientEvent(name = "beforeExecute"),
		@ClientEvent(name = "onExecute"), @ClientEvent(name = "onSuccess"),
		@ClientEvent(name = "onFailure") })
public class Action extends Component {
	private String caption;
	private String icon;
	private String iconClass;
	private String tip;
	private boolean disabled;
	private Object parameter;
	private String hotkey;
	private String confirmMessage;
	private String successMessage;

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

	public String getTip() {
		return tip;
	}

	public void setTip(String tip) {
		this.tip = tip;
	}

	public boolean isDisabled() {
		return disabled;
	}

	public void setDisabled(boolean disabled) {
		this.disabled = disabled;
	}

	@XmlProperty
	@ClientProperty(outputter = "spring:dorado.doradoMapPropertyOutputter")
	@IdeProperty(editor = "any")
	public Object getParameter() {
		return parameter;
	}

	public void setParameter(Object parameter) {
		this.parameter = parameter;
	}

	@IdeProperty(enumValues = "f1,f2,ctrl+s,alt+s,shift+s,ctrl+alt+shift+s,return,space,backspace,left,right,up,down")
	public String getHotkey() {
		return hotkey;
	}

	public void setHotkey(String hotkey) {
		this.hotkey = hotkey;
	}

	public String getConfirmMessage() {
		return confirmMessage;
	}

	public void setConfirmMessage(String confirmMessage) {
		this.confirmMessage = confirmMessage;
	}

	public String getSuccessMessage() {
		return successMessage;
	}

	public void setSuccessMessage(String successMessage) {
		this.successMessage = successMessage;
	}
}
