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

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Vector;

import com.bstek.dorado.view.socket.Message;
import com.bstek.dorado.view.socket.Socket;
import com.bstek.dorado.view.socket.SocketConnectionListener;
import com.bstek.dorado.view.socket.SocketSendListener;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2014-1-23
 */
public class LongPollingGroup implements SocketSendListener,
		SocketConnectionListener {

	static class MessageWrapper {
		private String socketId;
		private Message message;

		public MessageWrapper(String socketId, Message message) {
			this.socketId = socketId;
			this.message = message;
		}

		public String getSocketId() {
			return socketId;
		}

		public Message getMessage() {
			return message;
		}
	}

	private Collection<LongPollingSocket> listenedSockets = new HashSet<LongPollingSocket>();
	private List<MessageWrapper> outMessages = new Vector<MessageWrapper>();
	private Object responseLock = new Object();
	private boolean polling = false;
	private boolean responsing = false;

	public synchronized void addSocket(Socket socket) {
		synchronized (socket) {
			if (socket.isConnected()) {
				LongPollingSocket longPollingSocket = (LongPollingSocket) socket;
				listenedSockets.add(longPollingSocket);
				socket.addSendListener(this);
				socket.addConnectionListener(this);
			}
		}
	}

	public synchronized void onSend(Socket socket, Message message) {
		outMessages.add(new MessageWrapper(socket.getId(), message));
		notify();
	}

	public void terminate() {
		synchronized (this) {
			if (polling) {
				notify();
			}
		}
		synchronized (responseLock) {
			if (responsing) {
				responseLock.notify();
			}
		}
	}

	public synchronized void onDisconnect(Socket socket) {
		listenedSockets.remove(socket);
		socket.removeSendListener(this);
		socket.removeConnectionListener(this);
	}

	private synchronized void unbind() {
		for (Socket socket : listenedSockets) {
			socket.removeSendListener(this);
			socket.removeConnectionListener(this);
		}
		listenedSockets.clear();
	}

	public List<MessageWrapper> polling(long pollDuration, long responseDelay)
			throws InterruptedException {
		if (outMessages.isEmpty()) {
			synchronized (this) {
				polling = true;
				wait(pollDuration);
				polling = false;
			}
		}

		if (!outMessages.isEmpty()) {
			synchronized (responseLock) {
				responsing = true;
				responseLock.wait(responseDelay);
				responsing = false;
			}
		}

		unbind();
		return new ArrayList<MessageWrapper>(outMessages);
	}
}