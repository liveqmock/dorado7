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
import com.bstek.dorado.annotation.XmlNodeWrapper;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.annotation.XmlSubNode;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.InnerElementList;

/**
 * 面板控件。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 2, 2008
 */
@Widget(name = "Panel", category = "General", dependsPackage = "base-widget-desktop")
@ClientObject(prototype = "dorado.widget.Panel", shortTypeName = "Panel")
@ClientEvents({ @ClientEvent(name = "beforeMaximize"),
		@ClientEvent(name = "onMaximize") })
public class Panel extends AbstractPanel {

	@SuppressWarnings("deprecation")
	private PanelBorder border = PanelBorder.normal;

	private Boolean showCaptionBar;
	private boolean maximizeable;
	private boolean maximized;

	private boolean closeable;
	private String iconClass;
	private String background;
	private CloseAction closeAction = CloseAction.hide;
	private String icon;
	private List<SimpleIconButton> tools = new InnerElementList<SimpleIconButton>(
			this);

	public Panel() {
		setCollapseable(false);
	}

	@ClientProperty(escapeValue = "normal")
	@XmlProperty(deprecated = true)
	@Deprecated
	public PanelBorder getBorder() {
		return border;
	}

	@Deprecated
	public void setBorder(PanelBorder border) {
		this.border = border;
	}

	public Boolean getShowCaptionBar() {
		return showCaptionBar;
	}

	public void setShowCaptionBar(Boolean showCaptionBar) {
		this.showCaptionBar = showCaptionBar;
	}

	public String getIcon() {
		return icon;
	}

	public void setIcon(String icon) {
		this.icon = icon;
	}

	public void addTool(SimpleIconButton tool) {
		tools.add(tool);
	}

	@XmlSubNode(wrapper = @XmlNodeWrapper(nodeName = "Tools", icon = "/com/bstek/dorado/view/widget/base/Tools.png"))
	@ClientProperty
	public List<SimpleIconButton> getTools() {
		return tools;
	}

	public boolean isMaximizeable() {
		return maximizeable;
	}

	public void setMaximizeable(boolean maximizeable) {
		this.maximizeable = maximizeable;
	}

	public boolean isMaximized() {
		return maximized;
	}

	public void setMaximized(boolean maximized) {
		this.maximized = maximized;
	}

	public boolean isCloseable() {
		return closeable;
	}

	public void setCloseable(boolean closeable) {
		this.closeable = closeable;
	}

	@ClientProperty(escapeValue = "hide")
	public CloseAction getCloseAction() {
		return closeAction;
	}

	public void setCloseAction(CloseAction closeAction) {
		this.closeAction = closeAction;
	}

	@Override
	@ClientProperty(escapeValue = "false")
	public boolean isCollapseable() {
		return super.isCollapseable();
	}

	public String getIconClass() {
		return iconClass;
	}

	public void setIconClass(String iconClass) {
		this.iconClass = iconClass;
	}

	public String getBackground() {
		return background;
	}

	public void setBackground(String background) {
		this.background = background;
	}

}
