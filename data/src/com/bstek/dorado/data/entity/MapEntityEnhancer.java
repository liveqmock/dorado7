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

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import net.sf.cglib.beans.BeanMap;

import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.data.type.EntityDataType;
import com.bstek.dorado.data.type.property.PropertyDef;

public abstract class MapEntityEnhancer extends EntityEnhancer {

	public MapEntityEnhancer(EntityDataType dataType) {
		super(dataType);
	}

	@Override
	@SuppressWarnings({ "unchecked", "rawtypes" })
	protected Set<String> doGetPropertySet(Object entity,
			boolean excludeExProperties) {
		Map<String, Object> exProperties = getExProperties(false);
		if (!excludeExProperties || exProperties == null
				|| exProperties.isEmpty()) {
			return ((Map) entity).keySet();
		} else {
			Set<String> propertySet = new HashSet<String>(
					((Map) entity).keySet());
			propertySet.addAll(exProperties.keySet());
			return propertySet;
		}
	}

	protected boolean isExProperty(Object entity, String property) {
		if (entity instanceof BeanMap) {
			return ((BeanMap) entity).containsKey(property);
		} else {
			return false;
		}
	}

	@Override
	public Object readProperty(Object entity, String property,
			boolean ignoreInterceptors) throws Throwable {
		boolean isExProp = isExProperty(entity, property);
		Object result = internalReadProperty(entity, property, isExProp);
		if (!ignoreInterceptors) {
			result = interceptReadMethod(entity, property, result, isExProp);
			if (dataType != null) {
				PropertyDef propertyDef = dataType.getPropertyDef(property);
				if (propertyDef != null) {
					DataType propertyDefDataType = propertyDef.getDataType();
					if (propertyDefDataType != null) {
						result = propertyDefDataType.fromObject(result);
					}
				}
			}
		}
		return result;
	}

	@Override
	public void writeProperty(Object entity, String property, Object value)
			throws Throwable {
		boolean isExProp = isExProperty(entity, property);
		if (interceptWriteMethod(entity, property, value, isExProp)) {
			internalWriteProperty(entity, property, value, isExProp);
		}
	}

}
