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

package com.bstek.dorado.view.longpolling;

import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

import com.bstek.dorado.view.socket.AbstractSocket;
import com.bstek.dorado.view.socket.Message;
import com.bstek.dorado.view.socket.SocketSendListener;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2014-1-22
 */
public class LongPollingSocket extends AbstractSocket {
	private String id = UUID.randomUUID().toString();
	private boolean connected = true;
	private long lastAccess;
	private long responseDelay = -1;
	private BlockingQueue<Message> inQueue = new LinkedBlockingQueue<Message>();
	private BlockingQueue<Message> outQueue = new LinkedBlockingQueue<Message>();

	public LongPollingSocket() {
		updateLastAccess();
	}

	public long getLastAccess() {
		return lastAccess;
	}

	public void updateLastAccess() {
		lastAccess = System.currentTimeMillis();
	}

	public String getId() {
		return id;
	}

	public boolean isConnected() {
		return connected;
	}

	public long getResponseDelay() {
		return responseDelay;
	}

	public void setResponseDelay(long responseDelay) {
		this.responseDelay = responseDelay;
	}

	@Override
	public synchronized void addSendListener(SocketSendListener listener) {
		super.addSendListener(listener);

		try {
			while (!outQueue.isEmpty()) {
				send(outQueue.remove());
			}
		} catch (Exception e) {
			// do nothing
		}
	}

	public void send(Message message) throws Exception {
		if (!fireSend(message)) {
			outQueue.offer(message);
		}
	}

	public void push(Message message) {
		if (!fireReceive(message)) {
			inQueue.offer(message);
		}
	}

	public Message receive() throws Exception {
		Message message = inQueue.take();
		if (message == Message.TERMINATE_MESSAGE) {
			return null;
		} else {
			updateLastAccess();
			fireReceive(message);
			return message;
		}
	}

	public void disconnect() throws Exception {
		disconnect(true);
	}

	public void disconnect(boolean sendTerminateMessage) throws Exception {
		connected = false;
		outQueue.clear();
		inQueue.clear();
		if (sendTerminateMessage) {
			inQueue.offer(Message.TERMINATE_MESSAGE);
		}
		fireDisconnect();
	}

}
