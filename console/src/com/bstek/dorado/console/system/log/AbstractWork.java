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

/**
 * @author Alex tong (mailto:alex.tong@bstek.com)
 * @since 2012-11-22
 */
public abstract class AbstractWork {

	private ExpirablePublisher publisher = new ExpirablePublisher();
	
	public ExpirablePublisher getPublisher() {
		return publisher;
	}
	
	private boolean onwork = false;
	/**
	 * 任务是否在执行状态
	 * @return
	 */
	synchronized
	public boolean isOnWork() {
		return onwork;
	}
	/**
	 * 开始执行任务
	 */
	synchronized
	public void startWork() {
		if (!onwork) {
			doStartWork();
			onwork = true;
		}
	}
	/**
	 * 停止任务
	 */
	synchronized
	public void stopWork() {
		if (onwork) {
			doStopWork();
			onwork = false;
		}
	}
	
	protected abstract void doStartWork();
	
	protected abstract void doStopWork();
}
