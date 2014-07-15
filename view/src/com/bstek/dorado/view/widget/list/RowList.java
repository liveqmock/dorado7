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

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-2-26
 */
@ClientEvents({ @ClientEvent(name = "onDataRowClick"),
		@ClientEvent(name = "onDataRowDoubleClick") })
public abstract class RowList extends AbstractList {
	private int rowHeight;
	private boolean highlightCurrentRow = true;
	private boolean highlightHoverRow = true;
	private boolean highlightSelectedRow = true;

	public int getRowHeight() {
		return rowHeight;
	}

	public void setRowHeight(int rowHeight) {
		this.rowHeight = rowHeight;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isHighlightCurrentRow() {
		return highlightCurrentRow;
	}

	public void setHighlightCurrentRow(boolean highlightCurrentRow) {
		this.highlightCurrentRow = highlightCurrentRow;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isHighlightHoverRow() {
		return highlightHoverRow;
	}

	public void setHighlightHoverRow(boolean highlightHoverRow) {
		this.highlightHoverRow = highlightHoverRow;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isHighlightSelectedRow() {
		return highlightSelectedRow;
	}

	public void setHighlightSelectedRow(boolean highlightSelectedRow) {
		this.highlightSelectedRow = highlightSelectedRow;
	}

}
