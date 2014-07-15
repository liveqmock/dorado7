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
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.view.annotation.Widget;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-8-10
 */
@Widget(name = "TextArea", category = "Form", dependsPackage = "base-widget")
@ClientObject(prototype = "dorado.widget.TextArea", shortTypeName = "TextArea")
@XmlNode(clientTypes = { ClientType.DESKTOP, ClientType.TOUCH })
public class TextArea extends AbstractTextEditor {
	private boolean required;
	private int minLength;
	private int maxLength;

	@ClientProperty(escapeValue = "false")
	@Override
	public boolean isSelectTextOnFocus() {
		return super.isSelectTextOnFocus();
	}

	@IdeProperty(editor = "multiLines")
	@Override
	public String getText() {
		return super.getText();
	}

	@Override
	public boolean isRequired() {
		return required;
	}

	@Override
	public void setRequired(boolean required) {
		this.required = required;
	}

	@Override
	public int getMinLength() {
		return minLength;
	}

	@Override
	public void setMinLength(int minLength) {
		this.minLength = minLength;
	}

	@Override
	public int getMaxLength() {
		return maxLength;
	}

	@Override
	public void setMaxLength(int maxLength) {
		this.maxLength = maxLength;
	}
}
