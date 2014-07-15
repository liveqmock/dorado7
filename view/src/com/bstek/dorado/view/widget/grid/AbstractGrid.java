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

package com.bstek.dorado.view.widget.grid;

import com.bstek.dorado.annotation.ClientProperty;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-9-28
 */
public abstract class AbstractGrid extends GridSupport {
	private String groupHeaderRenderer;
	private String groupFooterRenderer;
	private String filterBarRenderer;
	private String groupProperty;
	private boolean groupOnSort = true;
	private boolean showGroupFooter;
	private boolean showFilterBar;

	public String getGroupHeaderRenderer() {
		return groupHeaderRenderer;
	}

	public void setGroupHeaderRenderer(String groupHeaderRenderer) {
		this.groupHeaderRenderer = groupHeaderRenderer;
	}

	public String getGroupFooterRenderer() {
		return groupFooterRenderer;
	}

	public void setGroupFooterRenderer(String groupFooterRenderer) {
		this.groupFooterRenderer = groupFooterRenderer;
	}

	public String getFilterBarRenderer() {
		return filterBarRenderer;
	}

	public void setFilterBarRenderer(String filterBarRenderer) {
		this.filterBarRenderer = filterBarRenderer;
	}

	public String getGroupProperty() {
		return groupProperty;
	}

	public void setGroupProperty(String groupProperty) {
		this.groupProperty = groupProperty;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isGroupOnSort() {
		return groupOnSort;
	}

	public void setGroupOnSort(boolean groupOnSort) {
		this.groupOnSort = groupOnSort;
	}

	public boolean isShowGroupFooter() {
		return showGroupFooter;
	}

	public void setShowGroupFooter(boolean showGroupFooter) {
		this.showGroupFooter = showGroupFooter;
	}

	public boolean isShowFilterBar() {
		return showFilterBar;
	}

	public void setShowFilterBar(boolean showFilterBar) {
		this.showFilterBar = showFilterBar;
	}

}
