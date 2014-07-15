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
public class MonitoredTarget {
	private String id;
	private String name;
	private long monitoringTime;
	private long cancelTime;
	private boolean status;
	private long settingTime;
	private String description;
	private String type;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public long getSettingTime() {
		return settingTime;
	}

	public void setSettingTime(long settingTime) {
		this.settingTime = settingTime;
	}

	public long getMonitoringTime() {
		return monitoringTime;
	}

	public void setMonitoringTime(long monitoringTime) {
		this.monitoringTime = monitoringTime;
	}

	public long getCancelTime() {
		return cancelTime;
	}

	public void setCancelTime(long cancelTime) {
		this.cancelTime = cancelTime;
	}

	public boolean getStatus() {
		return status;
	}

	public void setStatus(boolean status) {
		this.status = status;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public MonitoredTarget(String id, String name, long monitoringTime,
			long cancelTime, boolean status, String description, String type) {
		super();
		this.id = id;
		this.name = name;
		this.monitoringTime = monitoringTime;
		this.cancelTime = cancelTime;
		this.status = status;
		this.description = description;
		this.type = type;
	}

	public MonitoredTarget() {

	}

	@Override
	public String toString() {
		StringBuilder builder = new StringBuilder();
		builder.append("MonitoredTarget [id=");
		builder.append(id);
		builder.append(", name=");
		builder.append(name);
		builder.append(", monitoringTime=");
		builder.append(monitoringTime);
		builder.append(", cancelTime=");
		builder.append(cancelTime);
		builder.append(", status=");
		builder.append(status);
		builder.append(", description=");
		builder.append(description);
		builder.append(", type=");
		builder.append(type);
		builder.append("]");
		return builder.toString();
	}

}
