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
import java.util.concurrent.Callable;

import com.bstek.dorado.view.socket.Message;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2014-1-25
 */
public abstract class LongTask implements Callable<Object> {
	private List<TaskMessageListener> taskMessageListeners;
	private TaskStateInfo stateInfo = new TaskStateInfo(TaskState.waiting);

	public synchronized void addMessageListener(TaskMessageListener listener) {
		if (taskMessageListeners == null) {
			taskMessageListeners = new ArrayList<TaskMessageListener>();
		}
		taskMessageListeners.add(listener);
	}

	public synchronized void removeMessageListener(TaskMessageListener listener) {
		if (taskMessageListeners != null) {
			taskMessageListeners.remove(listener);
		}
	}

	protected void fireStateChange(TaskStateInfo state) {
		if (taskMessageListeners != null) {
			for (TaskMessageListener listener : taskMessageListeners
					.toArray(new TaskMessageListener[0])) {
				listener.onStateChange(this, state);
			}
		}
	}

	protected void fireLog(TaskLog log) {
		if (taskMessageListeners != null) {
			for (TaskMessageListener listener : taskMessageListeners
					.toArray(new TaskMessageListener[0])) {
				listener.onLogAppend(this, log);
			}
		}
	}

	protected void fireSendMessage(Message message) {
		if (taskMessageListeners != null) {
			for (TaskMessageListener listener : taskMessageListeners
					.toArray(new TaskMessageListener[0])) {
				listener.onSendMessage(this, message);
			}
		}
	}

	public TaskStateInfo getStateInfo() {
		return stateInfo;
	}

	public synchronized void setStateInfo(TaskStateInfo stateInfo) {
		this.stateInfo = stateInfo;
		fireStateChange(stateInfo);
	}

	public void appendLog(TaskLog log) {
		fireLog(log);
	}

	public boolean isActive() {
		TaskState state = stateInfo.getState();
		return state == TaskState.running || state == TaskState.resuming;
	}

	public boolean isAlive() {
		TaskState state = stateInfo.getState();
		return state != TaskState.aborting || state == TaskState.aborted
				|| state != TaskState.terminated || state == TaskState.error;
	}

	public boolean isAbortRequired() {
		TaskState state = stateInfo.getState();
		return state == TaskState.aborting || state == TaskState.aborted;
	}

	public boolean isSuspendRequired() {
		TaskState state = stateInfo.getState();
		return state == TaskState.suspending || state == TaskState.suspended;
	}

	public final synchronized void abort() {
		if (isAlive()) {
			setStateInfo(new TaskStateInfo(TaskState.aborting));
		} else {
			throw new IllegalStateException();
		}
		doAbort();
	}

	protected void doAbort() {
	}

	public final synchronized void suspend() {
		if (stateInfo.getState() == TaskState.running) {
			setStateInfo(new TaskStateInfo(TaskState.suspending));
		} else {
			throw new IllegalStateException();
		}
		doSuspend();
	}

	protected void doSuspend() {
	}

	public final synchronized void resume() {
		if (stateInfo.getState() == TaskState.suspended) {
			setStateInfo(new TaskStateInfo(TaskState.resuming));
		} else {
			throw new IllegalStateException();
		}
		doResume();
	}

	protected void doResume() {
	}

	protected void onReceive(Message message) {
	}

	public void send(Message message) {

	}
}
