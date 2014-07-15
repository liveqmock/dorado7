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

package com.bstek.dorado.data.config.definition;

import java.util.Collection;
import java.util.List;

import com.bstek.dorado.config.definition.CreationContext;
import com.bstek.dorado.config.definition.Definition;
import com.bstek.dorado.config.definition.DefinitionUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2013-12-2
 */
public class EntityCollectionDefinition extends Definition {
	private Class<?> collectionType;
	private List<Object> entities;

	public void setCollectionType(Class<?> collectionType) {
		this.collectionType = collectionType;
	}

	public Class<?> getCollectionType() {
		return collectionType;
	}

	public List<Object> getEntities() {
		return entities;
	}

	public void setEntities(List<Object> entities) {
		this.entities = entities;
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	@Override
	protected Object doCreate(CreationContext context, Object[] constuctorArgs)
			throws Exception {
		Collection collection = (Collection) collectionType.newInstance();
		for (Object entity : entities) {
			collection.add(DefinitionUtils.getRealValue(entity, context));
		}
		return collection;
	}

}
