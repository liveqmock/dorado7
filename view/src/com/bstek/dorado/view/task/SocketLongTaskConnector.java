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

package com.bstek.dorado.view.task;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.view.socket.Message;
import com.bstek.dorado.view.socket.Socket;
import com.bstek.dorado.view.socket.SocketConnectionListener;
import com.bstek.dorado.view.socket.SocketReceiveListener;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2014-1-26
 */
public class SocketLongTaskConnector implements SocketConnectionListener,
		SocketReceiveListener, TaskThreadExecutionListener,
		TaskThreadMessageListener {
	private static final Log logger = LogFactory
			.getLog(SocketLongTaskConnector.class);

	private static final String QUERY_STATE = "query-state";
	private static final String SUSPEND = "suspend";
	private static final String RESUME = "resume";
	private static final String ABORT = "abort";

	private Socket socket;
	private LongTaskThread taskThread;
	private LongTask task;
	private List<SocketLongTaskConnectorListener> listeners;
	private boolean closed;

	public SocketLongTaskConnector(Socket socket) {
		this.socket = socket;

		socket.addConnectionListener(this);
		socket.addReceiveListener(this);
	}

	public Socket getSocket() {
		return socket;
	}

	public LongTaskThread getTaskThread() {
		return taskThread;
	}

	public void setTaskThread(LongTaskThread taskThread) {
		if (this.taskThread != null) {
			task = null;
			this.taskThread.removeExecutionListener(this);
			this.taskThread.removeMessageListener(this);
		}

		this.taskThread = taskThread;

		if (taskThread != null) {
			task = taskThread.getTask();
			taskThread.addExecutionListener(this);
			taskThread.addMessageListener(this);
		}
	}

	public LongTask getTask() {
		return task;
	}

	public synchronized void addListener(
			SocketLongTaskConnectorListener listener) {
		if (listeners == null) {
			listeners = new ArrayList<SocketLongTaskConnectorListener>();
		}
		listeners.add(listener);
	}

	public synchronized void removeListener(
			SocketLongTaskConnectorListener listener) {
		if (listeners != null) {
			listeners.remove(listener);
		}
	}

	protected void fireClose() {
		if (listeners != null) {
			for (SocketLongTaskConnectorListener listener : listeners
					.toArray(new SocketLongTaskConnectorListener[0])) {
				listener.onClose(this);
			}
		}
	}

	public void onReceive(Socket socket, Message message) {
		try {
			// query-state, abort
			String type = message.getType();
			if (QUERY_STATE.equals(type)) {
				if (task != null) {
					socket.send(new Message("state", task.getStateInfo()));
				}
			} else if (ABORT.equals(type)) {
				if (task != null) {
					task.abort();
				}
			} else if (SUSPEND.equals(type)) {
				if (task != null) {
					task.suspend();
				}
			} else if (RESUME.equals(type)) {
				if (task != null) {
					task.resume();
				}
			} else {
				task.onReceive(message);
			}
		} catch (Exception e) {
			logger.error(e, e);
		}
	}

	public void onDisconnect(Socket socket) {
		closed = true;
		socket.removeConnectionListener(this);
		socket.removeReceiveListener(this);
		fireClose();
	}

	public void onStateChange(LongTaskThread taskThread, TaskStateInfo state) {
		try {
			socket.send(new Message("state",
					new LongTaskSocketServer.TaskStatePacket(taskThread)));
		} catch (Exception e) {
			logger.error(e, e);
		}
	}

	public void onLogAppend(LongTaskThread taskThread, TaskLog log) {
		try {
			socket.send(new Message("log", log));
		} catch (Exception e) {
			logger.error(e, e);
		}
	}

	public void onSendMessage(LongTaskThread taskThread, Message message) {
		try {
			socket.send(message);
		} catch (Exception e) {
			logger.error(e, e);
		}
	}

	protected void removeTaskListeners() {
		taskThread.removeMessageListener(this);
		taskThread.removeExecutionListener(this);
	}

	public void onSuccess(LongTaskThread taskThread, Object result) {
		removeTaskListeners();
		fireClose();
	}

	public void onFailure(LongTaskThread taskThread, Exception e) {
		removeTaskListeners();
		fireClose();
	}

	public void onAbort(LongTaskThread taskThread) {
		removeTaskListeners();
		fireClose();
	}

	public boolean isClosed() {
		return closed;
	}

}
