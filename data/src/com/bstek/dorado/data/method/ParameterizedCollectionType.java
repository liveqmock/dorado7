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

package com.bstek.dorado.data.method;

import java.lang.reflect.Type;
import java.util.Collection;

import com.bstek.dorado.util.Assert;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-10-2
 */
public class ParameterizedCollectionType implements Type {
	private Class<Collection<?>> collectionType;
	private Class<?> elementType;

	public ParameterizedCollectionType(Class<Collection<?>> collectionType,
			Class<?> elementType) {
		Assert.notNull(collectionType);
		Assert.notNull(elementType);
		this.collectionType = collectionType;
		this.elementType = elementType;
	}

	public Class<Collection<?>> getCollectionType() {
		return collectionType;
	}

	public Class<?> getElementType() {
		return elementType;
	}
}
