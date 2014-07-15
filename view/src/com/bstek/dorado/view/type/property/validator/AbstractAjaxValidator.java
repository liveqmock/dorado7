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

package com.bstek.dorado.view.type.property.validator;

import com.bstek.dorado.annotation.ClientProperty;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-5-25
 */
public abstract class AbstractAjaxValidator extends AbstractValidator {
	private boolean async = true;
	private String executingMessage;

	@ClientProperty(escapeValue = "true")
	public boolean isAsync() {
		return async;
	}

	public void setAsync(boolean async) {
		this.async = async;
	}

	public String getExecutingMessage() {
		return executingMessage;
	}

	public void setExecutingMessage(String executingMessage) {
		this.executingMessage = executingMessage;
	}
}
