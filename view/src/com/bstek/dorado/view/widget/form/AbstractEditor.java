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

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.view.widget.Control;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-11-5
 */
@ClientEvents({ @ClientEvent(name = "beforePost"),
		@ClientEvent(name = "onPost"), @ClientEvent(name = "onPostFailed") })
public abstract class AbstractEditor extends Control {
	private boolean readOnly;
	private boolean supportsDirtyFlag = true;

	public boolean isReadOnly() {
		return readOnly;
	}

	public void setReadOnly(boolean readOnly) {
		this.readOnly = readOnly;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isSupportsDirtyFlag() {
		return supportsDirtyFlag;
	}

	public void setSupportsDirtyFlag(boolean supportsDirtyFlag) {
		this.supportsDirtyFlag = supportsDirtyFlag;
	}
}
