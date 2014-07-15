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

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.common.event.ClientEventSupportedObject;
import com.bstek.dorado.data.type.validator.MessageState;
import com.bstek.dorado.data.type.validator.ValidationMessage;
import com.bstek.dorado.data.type.validator.Validator;
import com.bstek.dorado.view.RunAt;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-7-27
 */
public abstract class AbstractValidator extends ClientEventSupportedObject
		implements Validator {
	private String name;
	private RunAt runAt = RunAt.client;
	private MessageState defaultResultState = MessageState.error;
	private boolean revalidateOldValue = true;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@ClientProperty(ignored = true)
	public RunAt getRunAt() {
		return runAt;
	}

	public void setRunAt(RunAt runAt) {
		this.runAt = runAt;
	}

	@ClientProperty(escapeValue = "error")
	public MessageState getDefaultResultState() {
		return defaultResultState;
	}

	public void setDefaultResultState(MessageState defaultResultState) {
		this.defaultResultState = defaultResultState;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isRevalidateOldValue() {
		return revalidateOldValue;
	}

	public void setRevalidateOldValue(boolean revalidateOldValue) {
		this.revalidateOldValue = revalidateOldValue;
	}

	private ValidationMessage trimSingleMessage(Object message) {
		if (message instanceof ValidationMessage) {
			return (ValidationMessage) message;
		} else {
			return new ValidationMessage(String.valueOf(message));
		}
	}

	public final List<ValidationMessage> validate(Object value)
			throws Exception {
		if (runAt != RunAt.client) {
			Object result = doValidate(value);
			if (result != null) {
				List<ValidationMessage> messages = new ArrayList<ValidationMessage>();
				if (result instanceof Collection) {
					for (Object message : (Collection<?>) result) {
						messages.add(trimSingleMessage(message));
					}
				} else {
					messages.add(trimSingleMessage(result));
				}
				return messages;
			}
		}
		return null;
	}

	protected abstract Object doValidate(Object value) throws Exception;

}
