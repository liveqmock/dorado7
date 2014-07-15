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

package com.bstek.dorado.view.widget.base.tab;

import java.util.List;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.XmlSubNode;
import com.bstek.dorado.view.annotation.Widget;

@Widget(name = "TabColumn", category = "General",
		dependsPackage = "base-widget-desktop")
@ClientObject(prototype = "dorado.widget.TabColumn",
		shortTypeName = "TabColumn")
public class TabColumn extends AbstractTabControl {
	private VerticalTabPlacement tabPlacement = VerticalTabPlacement.left;
	private boolean verticalText = false; 
	
	@XmlSubNode(implTypes = "com.bstek.dorado.view.widget.base.tab.Tab")
	@ClientProperty
	public List<Tab> getTabs() {
		return super.getTabs();
	}

	@ClientProperty(escapeValue = "left")
	public VerticalTabPlacement getTabPlacement() {
		return tabPlacement;
	}

	public void setTabPlacement(VerticalTabPlacement tabPlacement) {
		this.tabPlacement = tabPlacement;
	}

	@ClientProperty
	public boolean isVerticalText() {
		return verticalText;
	}

	public void setVerticalText(boolean verticalText) {
		this.verticalText = verticalText;
	}	
	
}
