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
import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.view.annotation.Widget;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-8-10
 */
@Widget(name = "DateDropDown", category = "Trigger",
		dependsPackage = "base-widget-desktop", autoGenerateId = true)
@ClientObject(prototype = "dorado.widget.DateDropDown",
		shortTypeName = "DateDropDown")
@ClientEvents({ @ClientEvent(name = "onFilterDate") })
@XmlNode(clientTypes = ClientType.DESKTOP)
public class DateDropDown extends DropDown {
	private boolean showTimeSpinner;
	private boolean showTodayButton = true;
	private boolean showConfirmButton = true;
	private SelectionMode selectionMode = SelectionMode.singleDate;

	public boolean isShowTimeSpinner() {
		return showTimeSpinner;
	}

	public void setShowTimeSpinner(boolean showTimeSpinner) {
		this.showTimeSpinner = showTimeSpinner;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isShowTodayButton() {
		return showTodayButton;
	}

	public void setShowTodayButton(boolean showTodayButton) {
		this.showTodayButton = showTodayButton;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isShowConfirmButton() {
		return showConfirmButton;
	}

	public void setShowConfirmButton(boolean showConfirmButton) {
		this.showConfirmButton = showConfirmButton;
	}

	@ClientProperty(escapeValue = "singleDate")
	public SelectionMode getSelectionMode() {
		return selectionMode;
	}

	public void setSelectionMode(SelectionMode selectionMode) {
		this.selectionMode = selectionMode;
	}

	public static enum SelectionMode {
		singleDate, multiDate
	}
}
