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

package com.bstek.dorado.view.widget.tree;

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.view.widget.list.DropMode;
import com.bstek.dorado.view.widget.list.RowList;
import com.bstek.dorado.view.widget.list.ScrollMode;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-9-30
 */
@ClientEvents({ @ClientEvent(name = "beforeExpand"),
		@ClientEvent(name = "onExpand"), @ClientEvent(name = "beforeCollapse"),
		@ClientEvent(name = "onCollapse"),
		@ClientEvent(name = "onNodeAttached"),
		@ClientEvent(name = "onNodeDetached"),
		@ClientEvent(name = "beforeCurrentChange"),
		@ClientEvent(name = "onRenderNode"),
		@ClientEvent(name = "beforeNodeCheckedChange"),
		@ClientEvent(name = "onNodeCheckedChange") })
public abstract class AbstractTree extends RowList {
	private String renderer;
	private int indent;
	private boolean showLines;
	private ExpandingMode expandingMode = ExpandingMode.async;
	private boolean expandingAnimated = true;
	private String defaultIcon;
	private String defaultIconClass;
	private String defaultExpandedIcon;
	private String defaultExpandedIconClass;
	private DropMode dropMode = DropMode.onItem;

	@Override
	public ScrollMode getScrollMode() {
		return super.getScrollMode();
	}

	public String getRenderer() {
		return renderer;
	}

	public void setRenderer(String renderer) {
		this.renderer = renderer;
	}

	public int getIndent() {
		return indent;
	}

	public void setIndent(int indent) {
		this.indent = indent;
	}

	public boolean isShowLines() {
		return showLines;
	}

	public void setShowLines(boolean showLines) {
		this.showLines = showLines;
	}

	@ClientProperty(escapeValue = "async")
	public ExpandingMode getExpandingMode() {
		return expandingMode;
	}

	public void setExpandingMode(ExpandingMode expandingMode) {
		this.expandingMode = expandingMode;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isExpandingAnimated() {
		return expandingAnimated;
	}

	public void setExpandingAnimated(boolean expandingAnimated) {
		this.expandingAnimated = expandingAnimated;
	}

	public String getDefaultIcon() {
		return defaultIcon;
	}

	public void setDefaultIcon(String defaultIcon) {
		this.defaultIcon = defaultIcon;
	}

	public String getDefaultIconClass() {
		return defaultIconClass;
	}

	public void setDefaultIconClass(String defaultIconClass) {
		this.defaultIconClass = defaultIconClass;
	}

	public String getDefaultExpandedIcon() {
		return defaultExpandedIcon;
	}

	public void setDefaultExpandedIcon(String defaultExpandedIcon) {
		this.defaultExpandedIcon = defaultExpandedIcon;
	}

	public String getDefaultExpandedIconClass() {
		return defaultExpandedIconClass;
	}

	public void setDefaultExpandedIconClass(String defaultExpandedIconClass) {
		this.defaultExpandedIconClass = defaultExpandedIconClass;
	}

	@Override
	@ClientProperty(escapeValue = "onItem")
	public DropMode getDropMode() {
		return dropMode;
	}

	@Override
	public void setDropMode(DropMode dropMode) {
		this.dropMode = dropMode;
	}
}
