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

package com.bstek.dorado.data.type.validator;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-5-25
 */
public class ValidationMessage {
	private MessageState state = MessageState.error;
	private String text;

	public ValidationMessage() {
	}

	public ValidationMessage(String text) {
		this.text = text;
	}

	public ValidationMessage(MessageState state, String text) {
		this(text);
		this.state = state;
	}

	public MessageState getState() {
		return state;
	}

	public void setState(MessageState state) {
		this.state = state;
	}

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}
}
