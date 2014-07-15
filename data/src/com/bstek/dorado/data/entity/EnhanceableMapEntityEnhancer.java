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

package com.bstek.dorado.data.entity;

import com.bstek.dorado.data.type.EntityDataType;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-12-19
 */
public class EnhanceableMapEntityEnhancer extends MapEntityEnhancer {

	public EnhanceableMapEntityEnhancer(EntityDataType dataType) {
		super(dataType);
	}

	@Override
	protected Object internalReadProperty(Object entity, String property)
			throws Exception {
		return ((EnhanceableEntity) entity).internalReadProperty(property);
	}

	@Override
	protected void internalWriteProperty(Object entity, String property,
			Object value) throws Exception {
		((EnhanceableEntity) entity).internalWriteProperty(property, value);
	}

}
