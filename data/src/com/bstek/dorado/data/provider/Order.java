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

package com.bstek.dorado.data.provider;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-6-18
 */
public class Order {
	private String property;
	private String propertyPath;
	private boolean desc;

	public Order() {
	}

	public Order(String property, boolean desc) {
		this.property = property;
		this.desc = desc;
	}

	public String getProperty() {
		return property;
	}

	public void setProperty(String property) {
		this.property = property;
	}

	public void setDesc(boolean desc) {
		this.desc = desc;
	}

	public String getPropertyPath() {
		return propertyPath;
	}

	public void setPropertyPath(String propertyPath) {
		this.propertyPath = propertyPath;
	}

	public boolean isDesc() {
		return desc;
	}
}
