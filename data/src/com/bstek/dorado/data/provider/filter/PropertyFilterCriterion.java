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

package com.bstek.dorado.data.provider.filter;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-9-18
 */
public class PropertyFilterCriterion extends FilterCriterion {
	private String otherProperty;
	private String otherPropertyPath;

	public String getOtherProperty() {
		return otherProperty;
	}

	public void setOtherProperty(String otherProperty) {
		this.otherProperty = otherProperty;
	}

	public String getOtherPropertyPath() {
		return otherPropertyPath;
	}

	public void setOtherPropertyPath(String otherPropertyPath) {
		this.otherPropertyPath = otherPropertyPath;
	}
}
