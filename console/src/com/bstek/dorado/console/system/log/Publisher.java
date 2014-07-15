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

package com.bstek.dorado.console.system.log;

import java.util.ArrayList;
import java.util.List;

abstract class Publisher<T extends LogBuffer> {

	protected List<T> listeners = new ArrayList<T>();

	abstract public T create();

	public String listenerId(T t) {
		return Integer.toHexString(System.identityHashCode(t));
	}

	public T find(String lid) {
		synchronized (listeners) {
			for (T listener : listeners) {
				String listenerId = listenerId(listener);
				if (listenerId.equals(lid)) {
					return listener;
				}
			}
		}

		return null;
	}

	public void register(T listener) {
		synchronized (listeners) {
			listeners.add(listener);
		}
	}

	public void unregister(T listener) {
		synchronized (listeners) {
			listeners.remove(listener);
		}
	}

	public void publish(Event event) {
		synchronized (listeners) {
			if (listeners.isEmpty())
				return;

			for (T listener : listeners) {
				try {
					listener.onPush(event);
				} catch (Throwable t) {
					this.onPushError(t, listener, event);
				}
			}
		}
	}

	protected void onPushError(Throwable t, T listener, Event event) {

	}
}
