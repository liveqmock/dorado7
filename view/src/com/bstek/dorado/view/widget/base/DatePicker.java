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

import java.util.Date;

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.Control;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-8-7
 */
@Widget(name = "DatePicker", category = "General",
		dependsPackage = "base-widget-desktop")
@XmlNode(nodeName = "DatePicker")
@ClientObject(prototype = "dorado.widget.DatePicker",
		shortTypeName = "DatePicker")
@ClientEvents({ @ClientEvent(name = "onPick"), @ClientEvent(name = "onClear"), @ClientEvent(name = "onConfirm"), @ClientEvent(name = "onCancel"),
		@ClientEvent(name = "onRefreshDateCell"), @ClientEvent(name = "onFilterDate") })
public class DatePicker extends Control {
	private Date date;
	private boolean showTimeSpinner = false;
	private boolean showConfirmButton = true;
	private boolean showTodayButton = true;
	private boolean showClearButton = true;
	private String yearMonthFormat;
	private SelectionMode selectionMode = SelectionMode.singleDate;
	
	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
	}

	@ClientProperty(escapeValue = "false")
	public boolean getShowTimeSpinner() {
		return showTimeSpinner;
	}

	public void setShowTimeSpinner(boolean showTimeSpinner) {
		this.showTimeSpinner = showTimeSpinner;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isShowConfirmButton() {
		return showConfirmButton;
	}

	public void setShowConfirmButton(boolean showConfirmButton) {
		this.showConfirmButton = showConfirmButton;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isShowTodayButton() {
		return showTodayButton;
	}

	public void setShowTodayButton(boolean showTodayButton) {
		this.showTodayButton = showTodayButton;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isShowClearButton() {
		return showClearButton;
	}

	public void setShowClearButton(boolean showClearButton) {
		this.showClearButton = showClearButton;
	}

	public String getYearMonthFormat() {
		return yearMonthFormat;
	}

	public void setYearMonthFormat(String yearMonthFormat) {
		this.yearMonthFormat = yearMonthFormat;
	}		
	
	/**
	 * @return the selectionMode
	 */
	@ClientProperty(escapeValue = "singleDate")
	public SelectionMode getSelectionMode() {
		return selectionMode;
	}

	/**
	 * @param selectionMode the selectionMode to set
	 */
	public void setSelectionMode(SelectionMode selectionMode) {
		this.selectionMode = selectionMode;
	}

	public static enum SelectionMode {
		singleDate, multiDate
	}
		
}
