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

package com.bstek.dorado.data.type;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Collection;
import java.util.Map;
import java.util.Set;

import com.bstek.dorado.data.entity.GenericCustomEntityAdapter;
import com.bstek.dorado.data.type.property.PropertyDef;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2013-11-11
 */
public abstract class GenericCustomEntityDataType<T> extends
		EntityDataTypeSupport implements CustomEntityDataType<T> {

	public Set<String> getPropertySet() {
		if (!isAcceptUnknownProperty()) {
			return getPropertyDefs().keySet();
		} else {
			throw new UnsupportedOperationException(
					"getPropertySet() not implemented for this case.");
		}
	}

	/**
	 * 从自定义数据对象中读取一个属性值。
	 */
	public abstract Object readProperty(T customEntity, String property)
			throws Exception;

	/**
	 * 向自定义数据对象中写入一个属性值。
	 */
	public abstract void writeProperty(T customEntity, String property,
			Object value) throws Exception;

	@SuppressWarnings({ "rawtypes", "unchecked" })
	protected Class<T> getEntityType() {
		Class cl = getClass();
		Class<T> resultType = null;
		Type superType = cl.getGenericSuperclass();

		if (superType instanceof ParameterizedType) {
			Type[] paramTypes = ((ParameterizedType) superType)
					.getActualTypeArguments();
			if (paramTypes.length > 0) {
				resultType = (Class<T>) paramTypes[0];
			}
		}
		return resultType;
	}

	@SuppressWarnings("unchecked")
	protected T createDataObject(Map<String, Object> map) throws Exception {
		Class<?> creationType = getCreationType();
		if (creationType == null) {
			creationType = getMatchType();
			if (creationType == null) {
				creationType = getEntityType();
			}
		}
		return (T) creationType.newInstance();
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	protected void writePropertyWithRudeType(T customEntity, String property,
			Object value) throws Exception {
		DataType dataType = null;
		PropertyDef propertyDef = getPropertyDef(property);
		if (propertyDef != null) {
			dataType = propertyDef.getDataType();
		}

		if (value != null) {
			if (dataType != null) {
				if (dataType instanceof CustomEntityDataType) {
					if (value instanceof Map) {
						value = ((CustomEntityDataType) dataType)
								.fromMap((Map<String, Object>) value);
					}
				} else if (dataType instanceof AggregationDataType) {
					AggregationDataType aggregationDataType = (AggregationDataType) dataType;
					DataType elementDataType = aggregationDataType
							.getElementDataType();
					if (elementDataType != null
							&& elementDataType instanceof CustomEntityDataType) {
						CustomEntityDataType customEntityDataType = (CustomEntityDataType) elementDataType;

						Class<?> creationType = aggregationDataType
								.getCreationType();
						if (creationType == null) {
							creationType = aggregationDataType.getMatchType();
						}

						Collection newCollection = (Collection) creationType
								.newInstance();
						for (Object element : (Collection) value) {
							if (element instanceof Map) {
								newCollection
										.add(customEntityDataType
												.fromMap((Map<String, Object>) element));
							} else {
								newCollection.add(element);
							}
						}
						value = newCollection;
					}
				} else {
					value = dataType.fromObject(value);
				}
			}
		}
		writeProperty(customEntity, property, value);
	}

	public T fromMap(Map<String, Object> map) throws Exception {
		T customEntity = createDataObject(map);
		for (Map.Entry<? extends String, ? extends Object> entry : map
				.entrySet()) {
			String property = entry.getKey();
			Object value = entry.getValue();
			writePropertyWithRudeType(customEntity, property, value);
		}
		return customEntity;
	}

	public Map<String, Object> toMap(T customEntity) throws Exception {
		return new GenericCustomEntityAdapter(customEntity, this);
	}
}
