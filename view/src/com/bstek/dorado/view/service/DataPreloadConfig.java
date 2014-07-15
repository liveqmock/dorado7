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

package com.bstek.dorado.view.service;

import java.util.List;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-4-29
 */
public class DataPreloadConfig {
	private String property;
	private int recursiveLevel = 0;
	private List<DataPreloadConfig> childPreloadConfigs;

	public String getProperty() {
		return property;
	}

	public void setProperty(String property) {
		this.property = property;
	}

	public int getRecursiveLevel() {
		return recursiveLevel;
	}

	public void setRecursiveLevel(int recursiveLevel) {
		this.recursiveLevel = recursiveLevel;
	}

	public List<DataPreloadConfig> getChildPreloadConfigs() {
		return childPreloadConfigs;
	}

	public void setChildPreloadConfigs(
			List<DataPreloadConfig> childPreloadConfigs) {
		this.childPreloadConfigs = childPreloadConfigs;
	}
}
