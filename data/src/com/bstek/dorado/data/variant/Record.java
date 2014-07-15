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

package com.bstek.dorado.data.variant;

import java.util.Map;

import com.bstek.dorado.data.entity.EntityState;
import com.bstek.dorado.data.type.DataType;

/**
 * 记录对象。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apirl 20, 2007
 */
public class Record extends MetaData {
	private static final long serialVersionUID = 4038526280395571125L;

	public Record() {
	}

	public Record(Map<String, ?> map) {
		super(map);
	}

	public DataType getDataType() {
		return getEntityEnhancer().getDataType();
	}

	public EntityState getState() {
		return getEntityEnhancer().getState();
	}

	public void setState(EntityState state) {
		getEntityEnhancer().setState(state);
	}

	public Map<String, Object> getOldValues() {
		return getEntityEnhancer().getOldValues();
	}
}
