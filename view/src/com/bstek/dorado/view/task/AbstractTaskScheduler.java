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

import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;

import com.bstek.dorado.util.Assert;
import com.bstek.dorado.web.DoradoContext;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2014-6-6
 */
public class AbstractTaskScheduler implements TaskScheduler,
		TaskThreadExecutionListener {
	private LongTaskDefinition taskDefinition;
	private LinkedHashSet<LongTaskThread> waitingTasks;
	private Set<LongTaskThread> runningTasks;
	private int maxWaiting;
	private int maxRunning;

	public void setTaskDefinition(LongTaskDefinition taskDefinition) {
		Assert.isNull(this.taskDefinition);

		this.taskDefinition = taskDefinition;
		maxWaiting = taskDefinition.getMaxWaiting();
		maxRunning = taskDefinition.getMaxRunning();

		if (maxWaiting > 0) {
			waitingTasks = new LinkedHashSet<LongTaskThread>();
		}
		runningTasks = new HashSet<LongTaskThread>();
	}

	protected void startTask(LongTaskThread taskThread) {
		runningTasks.add(taskThread);
		taskThread.start();
	}

	public void queueTask(DoradoContext context, LongTaskThread taskThread) {
		taskThread.addExecutionListener(this);
		if (maxRunning > 0) {
			boolean started = false;
			synchronized (runningTasks) {
				if (runningTasks.size() < maxRunning) {
					startTask(taskThread);
					started = true;
				}
			}

			if (!started) {
				if (maxWaiting > 0) {
					synchronized (waitingTasks) {
						if (waitingTasks.size() < maxWaiting) {
							waitingTasks.add(taskThread);
						} else {
							throw new IllegalStateException(
									"Too many waiting tasks.");
						}
					}
				} else {
					throw new IllegalStateException("Too many running tasks.");
				}
			}
		} else {
			startTask(taskThread);
		}
	}

	public boolean dequeueTask(DoradoContext context, LongTaskThread taskThread) {
		boolean removed = false;
		if (waitingTasks != null) {
			removed = waitingTasks.remove(taskThread);
		}
		return removed;
	}

	public Set<LongTaskThread> getRunningTasks() {
		return Collections.unmodifiableSet(runningTasks);
	}

	@SuppressWarnings("unchecked")
	public Set<LongTaskThread> getWaitingTasks() {
		return (waitingTasks != null) ? Collections
				.unmodifiableSet(waitingTasks) : Collections.EMPTY_SET;
	}

	protected void onTaskTerminate(LongTaskThread taskThread) {
		taskThread.removeExecutionListener(this);
		boolean removed = runningTasks.remove(taskThread);
		if (removed && maxWaiting > 0) {
			synchronized (waitingTasks) {
				if (!waitingTasks.isEmpty()) {
					LongTaskThread firstWaitingTask = waitingTasks.iterator()
							.next();
					waitingTasks.remove(firstWaitingTask);
					startTask(firstWaitingTask);
				}
			}
		}
	}

	public void onSuccess(LongTaskThread taskThread, Object result) {
		onTaskTerminate(taskThread);
	}

	public void onFailure(LongTaskThread taskThread, Exception e) {
		onTaskTerminate(taskThread);
	}

	public void onAbort(LongTaskThread taskThread) {
		onTaskTerminate(taskThread);
	}

}