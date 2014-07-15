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
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.Control;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-8-9
 */
@Widget(name = "ProgressBar", category = "General",
		dependsPackage = "base-widget")
@ClientObject(prototype = "dorado.widget.ProgressBar",
		shortTypeName = "ProgressBar")
@XmlNode(clientTypes = { ClientType.DESKTOP, ClientType.TOUCH })
public class ProgressBar extends Control {
	private float minValue;
	private float maxValue = 100;
	private String value;
	private String textPattern = "{percent}%";
	private boolean showText = true;
	private boolean effectEnable = false;

	public float getMinValue() {
		return minValue;
	}

	public void setMinValue(float minValue) {
		this.minValue = minValue;
	}

	@ClientProperty(escapeValue = "100")
	public float getMaxValue() {
		return maxValue;
	}

	public void setMaxValue(float maxValue) {
		this.maxValue = maxValue;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

	@ClientProperty(escapeValue = "{percent}%")
	public String getTextPattern() {
		return textPattern;
	}

	public void setTextPattern(String textPattern) {
		this.textPattern = textPattern;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isShowText() {
		return showText;
	}

	public void setShowText(boolean showText) {
		this.showText = showText;
	}

	public boolean isEffectEnable() {
		return effectEnable;
	}

	public void setEffectEnable(boolean effectEnable) {
		this.effectEnable = effectEnable;
	}

}
