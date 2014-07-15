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

package com.bstek.dorado.view.widget.list;

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.view.widget.Control;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-2-26
 */
@ClientEvents({ @ClientEvent(name = "onCurrentChange"),
		@ClientEvent(name = "beforeSelectionChange"),
		@ClientEvent(name = "onSelectionChange"),
		@ClientEvent(name = "onCompareItems"),
		@ClientEvent(name = "onFilterItem") })
public abstract class AbstractList extends Control {
	private ScrollMode scrollMode = ScrollMode.lazyRender;
	private SelectionMode selectionMode = SelectionMode.none;
	private boolean allowNoCurrent;
	private DragMode dragMode = DragMode.item;
	private DropMode dropMode = DropMode.insertItems;

	@ClientProperty(escapeValue = "lazyRender")
	public ScrollMode getScrollMode() {
		return scrollMode;
	}

	public void setScrollMode(ScrollMode scrollMode) {
		this.scrollMode = scrollMode;
	}

	@ClientProperty(escapeValue = "none")
	public SelectionMode getSelectionMode() {
		return selectionMode;
	}

	public void setSelectionMode(SelectionMode selectionMode) {
		this.selectionMode = selectionMode;
	}

	public boolean isAllowNoCurrent() {
		return allowNoCurrent;
	}

	public void setAllowNoCurrent(boolean allowNoCurrent) {
		this.allowNoCurrent = allowNoCurrent;
	}

	@ClientProperty(escapeValue = "item")
	public DragMode getDragMode() {
		return dragMode;
	}

	public void setDragMode(DragMode dragMode) {
		this.dragMode = dragMode;
	}

	@ClientProperty(escapeValue = "insertItems")
	public DropMode getDropMode() {
		return dropMode;
	}

	public void setDropMode(DropMode dropMode) {
		this.dropMode = dropMode;
	}

}
