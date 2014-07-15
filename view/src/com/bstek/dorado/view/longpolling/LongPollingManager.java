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
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import com.bstek.dorado.core.Configure;
import com.bstek.dorado.view.socket.Socket;
import com.bstek.dorado.view.socket.SocketConnectionListener;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2014-1-22
 */
public class LongPollingManager implements SocketConnectionListener {

	static class CleanupThread extends Thread {
		private Map<String, LongPollingSocket> sockets;
		long cleanUpInterval;
		private long socketTimeout;
		private boolean stoped;

		public CleanupThread(Map<String, LongPollingSocket> sockets,
				long cleanUpInterval, long socketTimeout) {
			setDaemon(true);
			this.sockets = sockets;
			this.cleanUpInterval = cleanUpInterval;
			this.socketTimeout = socketTimeout;
		}

		@Override
		public void run() {
			try {
				Thread.sleep(cleanUpInterval);
				while (!stoped) {
					List<LongPollingSocket> expiredSockets = null;
					long current = System.currentTimeMillis();
					synchronized (sockets) {
						for (LongPollingSocket socket : sockets.values()) {
							if (current - socket.getLastAccess() > socketTimeout) {
								if (expiredSockets == null) {
									expiredSockets = new ArrayList<LongPollingSocket>();
								}
								expiredSockets.add(socket);
							}
						}
					}
					if (expiredSockets != null) {
						for (LongPollingSocket socket : expiredSockets) {
							try {
								socket.disconnect();
							} catch (Exception e) {
								// do nothing
							}
							sockets.remove(socket.getId());
						}
					}
					Thread.sleep(cleanUpInterval);
				}
			} catch (InterruptedException e) {
				// do nothing
			}
		}

		public void stopMe() {
			stoped = true;
		}
	}

	private boolean inited;
	private long cleanUpInterval;
	private long socketTimeout;
	private Map<String, LongPollingSocket> sockets;
	private CleanupThread cleanupThread;

	public LongPollingSocket connect(String serviceName) throws Exception {
		synchronized (this) {
			if (!inited) {
				inited = true;
				cleanUpInterval = Configure.getLong(
						"view.longPolling.cleanUpInterval", 15000);
				socketTimeout = Configure.getLong(
						"view.longPolling.socketTimeout", 30000);
				sockets = new ConcurrentHashMap<String, LongPollingSocket>();
			}
		}

		LongPollingSocket socket = new LongPollingSocket();
		socket.addConnectionListener(this);

		synchronized (this) {
			sockets.put(socket.getId(), socket);
			if (cleanupThread == null) {
				cleanupThread = new CleanupThread(sockets, cleanUpInterval,
						socketTimeout);
				cleanupThread.start();
			}
		}
		return socket;
	}

	public synchronized void onDisconnect(Socket socket) {
		if (sockets != null) {
			sockets.remove(socket.getId());
			if (sockets.isEmpty() && cleanupThread != null) {
				cleanupThread.stopMe();
				cleanupThread = null;
			}
		}
	}

	public LongPollingSocket getSocket(String socketId) {
		return (sockets != null) ? sockets.get(socketId) : null;
	}

}
