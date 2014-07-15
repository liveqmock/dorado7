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

package com.bstek.dorado.data.type.property;

import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlProperty;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jun 24, 2009
 */
public class Mapping {
	private Object mapValues;
	private String keyProperty;
	private String valueProperty;

	@XmlProperty(parser = "spring:dorado.mapValuesParser")
	@IdeProperty(editor = "collection[pojo]")
	public Object getMapValues() {
		return mapValues;
	}

	public void setMapValues(Object mapValues) {
		this.mapValues = mapValues;
	}

	public String getKeyProperty() {
		return keyProperty;
	}

	public void setKeyProperty(String keyProperty) {
		this.keyProperty = keyProperty;
	}

	public String getValueProperty() {
		return valueProperty;
	}

	public void setValueProperty(String valueProperty) {
		this.valueProperty = valueProperty;
	}
}
