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

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2014-1-20
 */
public class LongTaskDefinition {
	private String name;
	private String schedular;
	private LongTaskScope scope = LongTaskScope.session;
	private int maxRunning = 0;
	private int maxWaiting = Integer.MAX_VALUE;

	public LongTaskDefinition(String name) {
		this.name = name;
	}

	public String getName() {
		return name;
	}

	public String getSchedular() {
		return schedular;
	}

	public void setSchedular(String schedular) {
		this.schedular = schedular;
	}

	public LongTaskScope getScope() {
		return scope;
	}

	public void setScope(LongTaskScope scope) {
		this.scope = scope;
	}

	public int getMaxRunning() {
		return maxRunning;
	}

	public void setMaxRunning(int maxRunning) {
		this.maxRunning = maxRunning;
	}

	public int getMaxWaiting() {
		return maxWaiting;
	}

	public void setMaxWaiting(int maxWaiting) {
		this.maxWaiting = maxWaiting;
	}

}
