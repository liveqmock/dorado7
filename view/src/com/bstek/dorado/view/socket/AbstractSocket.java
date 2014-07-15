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

package com.bstek.dorado.view.socket;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2014-1-23
 */
public abstract class AbstractSocket implements Socket {
	private List<SocketSendListener> sendListeners;
	private List<SocketReceiveListener> receiveListeners;
	private List<SocketConnectionListener> connectionListeners;
	private Object bindingObject;

	public Object getBindingObject() {
		return bindingObject;
	}

	public void setBindingObject(Object bindingObject) {
		this.bindingObject = bindingObject;
	}

	public synchronized void addSendListener(SocketSendListener listener) {
		if (sendListeners == null) {
			sendListeners = new ArrayList<SocketSendListener>();
		}
		sendListeners.add(listener);
	}

	public synchronized void removeSendListener(SocketSendListener listener) {
		if (sendListeners != null) {
			sendListeners.remove(listener);
		}
	}

	public synchronized void addReceiveListener(SocketReceiveListener listener) {
		if (receiveListeners == null) {
			receiveListeners = new ArrayList<SocketReceiveListener>();
		}
		receiveListeners.add(listener);
	}

	public synchronized void removeReceiveListener(
			SocketReceiveListener listener) {
		if (receiveListeners != null) {
			receiveListeners.remove(listener);
		}
	}

	public synchronized void addConnectionListener(
			SocketConnectionListener listener) {
		if (connectionListeners == null) {
			connectionListeners = new ArrayList<SocketConnectionListener>();
		}
		connectionListeners.add(listener);
	}

	public synchronized void removeConnectionListener(
			SocketConnectionListener listener) {
		if (connectionListeners != null) {
			connectionListeners.remove(listener);
		}
	}

	protected boolean fireSend(Message message) {
		boolean hasListener = false;
		if (sendListeners != null) {
			for (SocketSendListener listener : sendListeners
					.toArray(new SocketSendListener[0])) {
				hasListener = true;
				listener.onSend(this, message);
			}
		}
		return hasListener;
	}

	protected boolean fireReceive(Message message) {
		boolean hasListener = false;
		if (receiveListeners != null) {
			for (SocketReceiveListener listener : receiveListeners
					.toArray(new SocketReceiveListener[0])) {
				hasListener = true;
				listener.onReceive(this, message);
			}
		}
		return hasListener;
	}

	protected boolean fireDisconnect() {
		boolean hasListener = false;
		if (connectionListeners != null) {
			for (SocketConnectionListener listener : connectionListeners
					.toArray(new SocketConnectionListener[0])) {
				hasListener = true;
				listener.onDisconnect(this);
			}
		}
		return hasListener;
	}

}
