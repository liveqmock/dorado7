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

import java.util.List;

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.annotation.XmlSubNode;
import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.Control;
import com.bstek.dorado.view.widget.InnerElementList;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-11-4
 */
@Widget(name = "CardBook", category = "General", dependsPackage = "base-widget")
@ClientObject(prototype = "dorado.widget.CardBook", shortTypeName = "CardBook")
@XmlNode(clientTypes = { ClientType.DESKTOP, ClientType.TOUCH })
@ClientEvents({ @ClientEvent(name = "beforeCurrentChange"),
		@ClientEvent(name = "onCurrentChange") })
public class CardBook extends Control {
	private List<Control> controls = new InnerElementList<Control>(this);
	private int currentIndex;

	public int getCurrentIndex() {
		return currentIndex;
	}

	public void setCurrentIndex(int currentIndex) {
		this.currentIndex = currentIndex;
	}

	@Deprecated
	private int currentControl;

	@Deprecated
	@XmlProperty(deprecated = true)
	@IdeProperty(visible = false)
	public int getCurrentControl() {
		return currentControl;
	}

	@Deprecated
	public void setCurrentControl(int currentControl) {
		this.currentControl = currentControl;
	}

	public void setCurrentControl(String activeControlId) {
		int i = 0;
		for (Control control : controls) {
			if (activeControlId.equals(control.getId())) {
				setCurrentControl(i);
				return;
			}
			i++;
		}
		throw new IllegalArgumentException("No such child control ["
				+ activeControlId + "] in CardBook");
	}

	public void addControl(Control control) {
		controls.add(control);
	}

	@XmlSubNode
	@ClientProperty
	public List<Control> getControls() {
		return controls;
	}

}
