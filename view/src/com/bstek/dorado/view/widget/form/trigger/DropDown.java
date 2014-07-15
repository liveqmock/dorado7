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

package com.bstek.dorado.view.widget.form.trigger;

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientProperty;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-3-26
 */
@ClientEvents({ @ClientEvent(name = "onOpen"), @ClientEvent(name = "onClose"),
		@ClientEvent(name = "onValueSelect") })
public abstract class DropDown extends Trigger {
	private int width;
	private int minWidth;
	private int maxWidth;
	private int height;
	private int minHeight;
	private int maxHeight;
	private boolean autoOpen;
	private boolean postValueOnSelect = true;
	private String assignmentMap;

	public int getWidth() {
		return width;
	}

	public void setWidth(int width) {
		this.width = width;
	}

	public int getMinWidth() {
		return minWidth;
	}

	public void setMinWidth(int minWidth) {
		this.minWidth = minWidth;
	}

	public int getMaxWidth() {
		return maxWidth;
	}

	public void setMaxWidth(int maxWidth) {
		this.maxWidth = maxWidth;
	}

	public int getHeight() {
		return height;
	}

	public void setHeight(int height) {
		this.height = height;
	}

	public int getMinHeight() {
		return minHeight;
	}

	public void setMinHeight(int minHeight) {
		this.minHeight = minHeight;
	}

	public int getMaxHeight() {
		return maxHeight;
	}

	public void setMaxHeight(int maxHeight) {
		this.maxHeight = maxHeight;
	}

	public boolean isAutoOpen() {
		return autoOpen;
	}

	public void setAutoOpen(boolean autoOpen) {
		this.autoOpen = autoOpen;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isPostValueOnSelect() {
		return postValueOnSelect;
	}

	public void setPostValueOnSelect(boolean postValueOnSelect) {
		this.postValueOnSelect = postValueOnSelect;
	}

	public String getAssignmentMap() {
		return assignmentMap;
	}

	public void setAssignmentMap(String assignmentMap) {
		this.assignmentMap = assignmentMap;
	}

}
