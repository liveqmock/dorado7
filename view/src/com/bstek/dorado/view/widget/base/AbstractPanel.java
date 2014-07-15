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
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.XmlNodeWrapper;
import com.bstek.dorado.annotation.XmlSubNode;
import com.bstek.dorado.view.widget.Align;
import com.bstek.dorado.view.widget.Component;
import com.bstek.dorado.view.widget.Container;
import com.bstek.dorado.view.widget.InnerElementList;

@ClientEvents({ @ClientEvent(name = "beforeCollapsedChange"),
		@ClientEvent(name = "onCollapsedChange") })
public abstract class AbstractPanel extends Container {
	private String caption;
	private List<Button> buttons = new InnerElementList<Button>(this);
	private Align buttonAlign = Align.center;
	private boolean collapseable = true;
	private boolean collapsed = false;

	public String getCaption() {
		return caption;
	}

	public void setCaption(String caption) {
		this.caption = caption;
	}

	public void addButton(Button button) {
		buttons.add(button);
	}

	@XmlSubNode(nodeName = "*", parser = "spring:dorado.childComponentParser",
			wrapper = @XmlNodeWrapper(nodeName = "Buttons",
			icon = "/com/bstek/dorado/view/widget/base/Buttons.png"))
	@ClientProperty
	public List<Button> getButtons() {
		return buttons;
	}

	@ClientProperty(escapeValue = "center")
	public Align getButtonAlign() {
		return buttonAlign;
	}

	public void setButtonAlign(Align buttonAlign) {
		this.buttonAlign = buttonAlign;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isCollapseable() {
		return collapseable;
	}

	public void setCollapseable(boolean collapseable) {
		this.collapseable = collapseable;
	}

	@ClientProperty(escapeValue = "false")
	public boolean isCollapsed() {
		return collapsed;
	}

	public void setCollapsed(boolean collapsed) {
		this.collapsed = collapsed;
	}

	@Override
	@XmlSubNode(nodeName = "*", parser = "spring:dorado.childComponentParser",
			wrapper = @XmlNodeWrapper(nodeName = "Children",
					icon = "/com/bstek/dorado/view/widget/base/Children.png"))
	@ClientProperty
	public List<Component> getChildren() {
		return super.getChildren();
	}

}
