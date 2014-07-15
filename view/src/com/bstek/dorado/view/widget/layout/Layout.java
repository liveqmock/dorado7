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

import com.bstek.dorado.annotation.TextSection;

/**
 * 布局管理器的抽象类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jan 19, 2008
 */
@TextSection(parser = "spring:dorado.layoutTextParser")
public abstract class Layout {

	/**
	 * 用于表示某控件不参与布局管理的特殊布局条件，即布局管理器将在渲染时忽略对该控件的处理。
	 */
	public final static Object NON_LAYOUT_CONSTRAINT = "none";

	private String className;
	private int padding;

	/**
	 * @return the className
	 */
	public String getClassName() {
		return className;
	}

	/**
	 * @param className
	 *            the className to set
	 */
	public void setClassName(String className) {
		this.className = className;
	}

	public int getPadding() {
		return padding;
	}

	public void setPadding(int padding) {
		this.padding = padding;
	}
}
