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
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.FloatControlShadowMode;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-6-2
 */
@Widget(name = "Dialog", category = "Floatable", dependsPackage = "base-widget-desktop")
@ClientObject(prototype = "dorado.widget.Dialog", shortTypeName = "Dialog")
@ClientEvents({ @ClientEvent(name = "beforeMinimize"),
		@ClientEvent(name = "onMinimize") })
public class Dialog extends FloatPanel {
	private int minWidth;
	private int minHeight;
	private int maxWidth;
	private int maxHeight;
	private boolean dragOutside;
	private boolean resizeable = true;

	private boolean minimizeable;
	private boolean minimized;

	public Dialog() {
		setShadowMode(FloatControlShadowMode.frame);
		setCloseable(true);
		setDraggable(true);
		setCenter(true);
		setModal(true);
	}

	@Override
	@ClientProperty(escapeValue = "true")
	public boolean isDraggable() {
		return super.isDraggable();
	}

	@Override
	@ClientProperty(escapeValue = "true")
	public boolean isCloseable() {
		return super.isCloseable();
	}

	@Override
	@ClientProperty(escapeValue = "true")
	public boolean isCenter() {
		return super.isCenter();
	}

	@Override
	@ClientProperty(escapeValue = "true")
	public boolean isModal() {
		return super.isModal();
	}

	@Override
	@ClientProperty(escapeValue = "frame")
	public FloatControlShadowMode getShadowMode() {
		return super.getShadowMode();
	}

	public int getMinWidth() {
		return minWidth;
	}

	public void setMinWidth(int minWidth) {
		this.minWidth = minWidth;
	}

	public int getMinHeight() {
		return minHeight;
	}

	public void setMinHeight(int minHeight) {
		this.minHeight = minHeight;
	}	

	public int getMaxWidth() {
		return maxWidth;
	}

	public void setMaxWidth(int maxWidth) {
		this.maxWidth = maxWidth;
	}

	public int getMaxHeight() {
		return maxHeight;
	}

	public void setMaxHeight(int maxHeight) {
		this.maxHeight = maxHeight;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isResizeable() {
		return resizeable;
	}

	public void setResizeable(boolean resizeable) {
		this.resizeable = resizeable;
	}

	public boolean isMinimizeable() {
		return minimizeable;
	}

	public void setMinimizeable(boolean minimizeable) {
		this.minimizeable = minimizeable;
	}

	public boolean isMinimized() {
		return minimized;
	}

	public void setMinimized(boolean minimized) {
		this.minimized = minimized;
	}

	/**
	 * @return the dragOutside
	 */
	public boolean isDragOutside() {
		return dragOutside;
	}

	/**
	 * @param dragOutside
	 *            the dragOutside to set
	 */
	public void setDragOutside(boolean dragOutside) {
		this.dragOutside = dragOutside;
	}

}
