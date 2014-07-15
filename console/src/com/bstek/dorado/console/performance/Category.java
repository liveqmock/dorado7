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

package com.bstek.dorado.console.performance;

/**
 * 
 *
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since  2013-3-4
 */
public class Category {
	private String name;
	private Process maxTimeProcess;
	private Process excludeFirstMaxProcess;
	private Process minTimeProcess;
	private double avgTime;
	private double excludeFirstAvgTime;
	private int count;
	private Process firstProcess;

	public Category(String name) {
		this.name = name;
	}

	synchronized public void registerProcess(Process processInfo) {
		avgTime = (avgTime * count + processInfo.getSpendTime()) / (count + 1);
		count++;
		if (firstProcess == null) {
			maxTimeProcess = processInfo;
			minTimeProcess = processInfo;
			firstProcess = processInfo;
			return;
		} else {
			excludeFirstAvgTime = (excludeFirstAvgTime * (count - 2) + processInfo
					.getSpendTime()) / (count - 1);

		}
		if (excludeFirstMaxProcess==null||processInfo.getSpendTime() >= excludeFirstMaxProcess.getSpendTime()) {
			excludeFirstMaxProcess = processInfo;
		}
		if (processInfo.getSpendTime() >= maxTimeProcess.getSpendTime()) {
			maxTimeProcess = processInfo;
			return;
		}
		if (processInfo.getSpendTime() <= minTimeProcess.getSpendTime()) {
			minTimeProcess = processInfo;
		}

	}

	public Process getMaxTimeProcess() {
		return maxTimeProcess;
	}

	public Process getMinTimeProcess() {
		return minTimeProcess;
	}

	public double getAvgTime() {
		return avgTime;
	}

	public String getName() {
		return name;
	}



	public double getExcludeFirstAvgTime() {
		return excludeFirstAvgTime;
	}

	public int getCount() {
		return count;
	}

	public Process getFirstProcess() {
		return firstProcess;
	}

	public Process getExcludeFirstMaxProcess() {
		return excludeFirstMaxProcess;
	}

	public void setExcludeFirstMaxProcess(Process excludeFirstMaxProcess) {
		this.excludeFirstMaxProcess = excludeFirstMaxProcess;
	}
	
	

}
