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

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2014-1-26
 */
public class LongTaskThread extends Thread implements TaskMessageListener {
	private static final Log logger = LogFactory.getLog(LongTaskThread.class);

	private LongTask task;
	private long waitingStartTime;
	private long runningStartTime;
	private List<TaskThreadMessageListener> messageListeners;
	private List<TaskThreadExecutionListener> executionListeners;

	public LongTaskThread(LongTask task) {
		this.task = task;
		waitingStartTime = System.currentTimeMillis();
		task.addMessageListener(this);
	}

	public LongTask getTask() {
		return task;
	}

	public long getWaitingStartTime() {
		return waitingStartTime;
	}

	public long getRunningStartTime() {
		return runningStartTime;
	}

	public synchronized void addMessageListener(
			TaskThreadMessageListener listener) {
		if (messageListeners == null) {
			messageListeners = new ArrayList<TaskThreadMessageListener>();
		}
		messageListeners.add(listener);
	}

	public synchronized void removeMessageListener(
			TaskThreadMessageListener listener) {
		if (messageListeners != null) {
			messageListeners.remove(listener);
		}
	}

	protected void fireTaskStateChange(TaskStateInfo state) {
		if (messageListeners != null) {
			for (TaskThreadMessageListener listener : messageListeners
					.toArray(new TaskThreadMessageListener[0])) {
				listener.onStateChange(this, state);
			}
		}
	}

	protected void fireTaskLog(TaskLog log) {
		if (messageListeners != null) {
			for (TaskThreadMessageListener listener : messageListeners
					.toArray(new TaskThreadMessageListener[0])) {
				listener.onLogAppend(this, log);
			}
		}
	}

	protected void fireSendMessage(Message message) {
		if (messageListeners != null) {
			for (TaskThreadMessageListener listener : messageListeners
					.toArray(new TaskThreadMessageListener[0])) {
				listener.onSendMessage(this, message);
			}
		}
	}

	public synchronized void addExecutionListener(
			TaskThreadExecutionListener listener) {
		if (executionListeners == null) {
			executionListeners = new ArrayList<TaskThreadExecutionListener>();
		}
		executionListeners.add(listener);
	}

	public synchronized void removeExecutionListener(
			TaskThreadExecutionListener listener) {
		if (executionListeners != null) {
			executionListeners.remove(listener);
		}
	}

	protected void fireTaskSuccess(LongTask task, Object result) {
		if (executionListeners != null) {
			for (TaskThreadExecutionListener listener : executionListeners
					.toArray(new TaskThreadExecutionListener[0])) {
				listener.onSuccess(this, result);
			}
		}
	}

	protected void fireTaskFailure(LongTask task, Exception e) {
		if (executionListeners != null) {
			for (TaskThreadExecutionListener listener : executionListeners
					.toArray(new TaskThreadExecutionListener[0])) {
				listener.onFailure(this, e);
			}
		}
	}

	protected void fireTaskAbort(LongTask task) {
		if (executionListeners != null) {
			for (TaskThreadExecutionListener listener : executionListeners
					.toArray(new TaskThreadExecutionListener[0])) {
				listener.onAbort(this);
			}
		}
	}

	public void onStateChange(LongTask task, TaskStateInfo state) {
		fireTaskStateChange(state);
	}

	public void onLogAppend(LongTask task, TaskLog log) {
		fireTaskLog(log);
	}

	public void onSendMessage(LongTask task, Message message) {
		fireSendMessage(message);
	}

	@Override
	public void run() {
		runningStartTime = System.currentTimeMillis();
		try {
			task.setStateInfo(new TaskStateInfo(TaskState.running));
			Object result = task.call();
			if (task.isActive()) {
				TaskStateInfo stateInfo = new TaskStateInfo(
						TaskState.terminated);
				stateInfo.setData(result);
				task.setStateInfo(stateInfo);
				fireTaskSuccess(task, result);
			} else {
				task.setStateInfo(new TaskStateInfo(TaskState.aborted));
				fireTaskAbort(task);
			}
		} catch (Exception e) {
			TaskStateInfo stateInfo = new TaskStateInfo(TaskState.error);
			stateInfo.setData(new ExceptionInfo(e));
			task.setStateInfo(stateInfo);
			fireTaskFailure(task, e);
			logger.error(e, e);
		}
	}

}

class ExceptionInfo {
	private String message;
	private String[] stackTrace;

	public ExceptionInfo(Exception e) {
		Throwable throwable = e;
		// while (throwable.getCause() != null) {
		// throwable = throwable.getCause();
		// }

		message = throwable.getMessage();
		if (message == null) {
			message = throwable.getClass().getSimpleName();
		}

		StackTraceElement[] stackTraceElements = throwable.getStackTrace();
		stackTrace = new String[stackTraceElements.length];
		int i = 0;
		for (StackTraceElement stackTraceElement : stackTraceElements) {
			stackTrace[i] = stackTraceElement.getClassName() + '.'
					+ stackTraceElement.getMethodName() + '('
					+ stackTraceElement.getFileName() + ':'
					+ stackTraceElement.getLineNumber() + ')';
			i++;
		}
	}

	public String getExceptionType() {
		return "JavaException";
	}

	public String getMessage() {
		return message;
	}

	public String[] getStackTrace() {
		return stackTrace;
	}
}
