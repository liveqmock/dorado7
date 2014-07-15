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

package com.bstek.dorado.view;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import com.bstek.dorado.common.event.ClientEvent;
import com.bstek.dorado.common.event.ClientEventHolder;
import com.bstek.dorado.common.event.ClientEventSupported;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2014-1-15
 */
public abstract class ClientEventSupportedElement extends AbstractViewElement
		implements ClientEventSupported {
	private ClientEventHolder clientEventHolder;

	private ClientEventHolder getClientEventHolder() {
		if (clientEventHolder == null) {
			clientEventHolder = createClientEventHolder();
		}
		return clientEventHolder;
	}

	protected ClientEventHolder createClientEventHolder() {
		return new ClientEventHolder(this);
	}

	public void addClientEventListener(String eventName,
			ClientEvent eventListener) {
		getClientEventHolder().addClientEventListener(eventName, eventListener);
	}

	@SuppressWarnings("unchecked")
	public List<ClientEvent> getClientEventListeners(String eventName) {
		return (clientEventHolder != null) ? clientEventHolder
				.getClientEventListeners(eventName) : Collections.EMPTY_LIST;
	}

	public void clearClientEventListeners(String eventName) {
		if (clientEventHolder != null) {
			clientEventHolder.clearClientEventListeners(eventName);
		}
	}

	@SuppressWarnings("unchecked")
	public Map<String, List<ClientEvent>> getAllClientEventListeners() {
		return (clientEventHolder != null) ? clientEventHolder
				.getAllClientEventListeners() : Collections.EMPTY_MAP;
	}

}