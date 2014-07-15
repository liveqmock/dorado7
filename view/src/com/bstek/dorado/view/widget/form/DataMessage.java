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

package com.bstek.dorado.view.widget.form;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.datacontrol.AbstractPropertyDataControl;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-5-26
 */
@Widget(name = "DataMessage", category = "Form", dependsPackage = "base-widget")
@ClientObject(prototype = "dorado.widget.DataMessage",
		shortTypeName = "DataMessage")
@XmlNode(clientTypes = { ClientType.DESKTOP, ClientType.TOUCH })
public class DataMessage extends AbstractPropertyDataControl {
	private boolean showIconOnly;
	private boolean showMultiMessage;

	public boolean isShowIconOnly() {
		return showIconOnly;
	}

	public void setShowIconOnly(boolean showIconOnly) {
		this.showIconOnly = showIconOnly;
	}

	public boolean isShowMultiMessage() {
		return showMultiMessage;
	}

	public void setShowMultiMessage(boolean showMultiMessage) {
		this.showMultiMessage = showMultiMessage;
	}
}
