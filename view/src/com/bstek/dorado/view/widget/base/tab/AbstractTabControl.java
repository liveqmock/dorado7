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

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ResourceInjection;
import com.bstek.dorado.view.widget.Control;
import com.bstek.dorado.view.widget.InnerElementList;

@ClientEvents({ @ClientEvent(name = "beforeTabChange"),
		@ClientEvent(name = "onTabChange"),
		@ClientEvent(name = "onTabRemove"),
		@ClientEvent(name = "onTabContextMenu") })
@ResourceInjection(subObjectMethod = "getTab")
public abstract class AbstractTabControl extends Control {
	private boolean alwaysShowNavButtons;
	private List<Tab> tabs = new InnerElementList<Tab>(this);
	private int currentTab;

	public boolean isAlwaysShowNavButtons() {
		return alwaysShowNavButtons;
	}

	public void setAlwaysShowNavButtons(boolean alwaysShowNavButtons) {
		this.alwaysShowNavButtons = alwaysShowNavButtons;
	}

	public int getCurrentTab() {
		return currentTab;
	}

	public void setCurrentTab(int currentTab) {
		this.currentTab = currentTab;
	}

	public void setCurrentTab(Tab currentTab) {
		int i = tabs.indexOf(currentTab);
		if (i >= 0) {
			setCurrentTab(i);
		} else {
			throw new IllegalArgumentException(
					"The current Tab must belongs to this TabControl.");
		}
	}

	public void setCurrentTab(String currentTabName) {
		int i = 0;
		for (Tab tab : tabs) {
			if (currentTabName.equals(tab.getName())) {
				setCurrentTab(i);
				return;
			}
			i++;
		}
		throw new IllegalArgumentException("No such Tab [" + currentTabName
				+ "] in TabControl.");
	}

	public void addTab(Tab tab) {
		tabs.add(tab);
	}

	public List<Tab> getTabs() {
		return tabs;
	}

	public Tab getTab(String name) {
		for (Tab tab : tabs) {
			if (name.equals(tab.getName())) {
				return tab;
			}
		}
		return null;
	}

}
