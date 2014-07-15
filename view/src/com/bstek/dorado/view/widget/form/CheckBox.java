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

package com.bstek.dorado.view.widget.form;

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.view.annotation.Widget;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-11-5
 */
@Widget(name = "CheckBox", category = "Form", dependsPackage = "base-widget")
@ClientObject(prototype = "dorado.widget.CheckBox", shortTypeName = "CheckBox")
@ClientEvents({ @ClientEvent(name = "onValueChange") })
@XmlNode(clientTypes = { ClientType.DESKTOP, ClientType.TOUCH })
public class CheckBox extends AbstractDataEditor {
	private Object onValue = true;
	private Object offValue = false;
	private Object mixedValue;
	private String caption;
	private Object value = false;
	private Boolean checked;
	private boolean triState;

	@XmlProperty
	@ClientProperty(escapeValue = "true")
	public Object getOnValue() {
		return onValue;
	}

	public void setOnValue(Object onValue) {
		this.onValue = onValue;
	}

	@XmlProperty
	@ClientProperty(escapeValue = "false")
	public Object getOffValue() {
		return offValue;
	}

	public void setOffValue(Object offValue) {
		this.offValue = offValue;
	}

	@XmlProperty
	@ClientProperty
	public Object getMixedValue() {
		return mixedValue;
	}

	public void setMixedValue(Object mixedValue) {
		this.mixedValue = mixedValue;
	}

	public String getCaption() {
		return caption;
	}

	public void setCaption(String caption) {
		this.caption = caption;
	}

	@XmlProperty
	@ClientProperty(escapeValue = "false")
	public Object getValue() {
		return value;
	}

	public void setValue(Object value) {
		this.value = value;
	}

	public Boolean isChecked() {
		return checked;
	}

	public Boolean getChecked() {
		return checked;
	}

	public boolean isTriState() {
		return triState;
	}

	public void setTriState(boolean triState) {
		this.triState = triState;
	}

}
