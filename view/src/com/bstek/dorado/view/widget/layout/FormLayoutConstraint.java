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

package com.bstek.dorado.view.widget.layout;

import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.view.widget.Align;
import com.bstek.dorado.view.widget.VerticalAlign;

public class FormLayoutConstraint extends LayoutConstraintSupport {
	private int colSpan = 1;
	private int rowSpan = 1;
	private Align align = Align.left;
	private VerticalAlign vAlign = VerticalAlign.top;

	public int getColSpan() {
		return colSpan;
	}

	public void setColSpan(int colSpan) {
		if (colSpan < 1)
			colSpan = 1;
		this.colSpan = colSpan;
	}

	public int getRowSpan() {
		return rowSpan;
	}

	public void setRowSpan(int rowSpan) {
		if (rowSpan < 1)
			rowSpan = 1;
		this.rowSpan = rowSpan;
	}

	@ClientProperty(escapeValue = "left")
	public Align getAlign() {
		return align;
	}

	public void setAlign(Align align) {
		this.align = align;
	}

	@ClientProperty(escapeValue = "top")
	public VerticalAlign getvAlign() {
		return vAlign;
	}

	public void setvAlign(VerticalAlign align) {
		vAlign = align;
	}
}
