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

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import com.bstek.dorado.data.type.AggregationDataType;
import com.bstek.dorado.data.type.CustomEntityDataType;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.data.type.GenericCustomEntityDataType;
import com.bstek.dorado.data.type.property.PropertyDef;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @param <K>
 * @since 2013-11-8
 */
@SuppressWarnings("rawtypes")
public class GenericCustomEntityAdapter implements Map<String, Object> {
	protected Object target;
	protected GenericCustomEntityDataType genericDataObjectDataType;

	public GenericCustomEntityAdapter(Object target,
			GenericCustomEntityDataType genericDataObjectDataType) {
		assert (target != null);

		this.target = target;
		this.genericDataObjectDataType = genericDataObjectDataType;
	}

	public Object getTarget() {
		return target;
	}

	public GenericCustomEntityDataType getGenericDataObjectDataType() {
		return genericDataObjectDataType;
	}

	@SuppressWarnings("unchecked")
	protected Set<String> getPropertySet() {
		return genericDataObjectDataType.getPropertySet();
	}

	@SuppressWarnings("unchecked")
	protected Object readProperty(String property) {
		DataType dataType = null;
		PropertyDef propertyDef = genericDataObjectDataType
				.getPropertyDef(property);
		if (propertyDef != null) {
			dataType = propertyDef.getDataType();
		}

		try {
			Object value = genericDataObjectDataType.readProperty(target,
					property);
			if (value != null && dataType != null) {
				if (dataType instanceof CustomEntityDataType) {
					value = ((CustomEntityDataType) dataType).toMap(value);
				} else if ((dataType instanceof AggregationDataType)) {
					AggregationDataType aggregationDataType = (AggregationDataType) dataType;
					DataType elementDataType = ((AggregationDataType) dataType)
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
							newCollection.add(customEntityDataType
									.toMap(element));
						}
						value = newCollection;
					}
				} else {
					value = dataType.fromObject(value);
				}
			}
			return value;
		} catch (Exception e) {
			throw new CustomEntityMapException(e);
		}
	}

	@SuppressWarnings("unchecked")
	protected void writeProperty(String property, Object value) {
		try {
			genericDataObjectDataType.writeProperty(target, property, value);
		} catch (Exception e) {
			throw new CustomEntityMapException(e);
		}
	}

	public int size() {
		return getPropertySet().size();
	}

	public boolean isEmpty() {
		return getPropertySet().isEmpty();
	}

	public boolean containsKey(Object key) {
		return getPropertySet().contains(key);
	}

	public boolean containsValue(Object value) {
		throw new UnsupportedOperationException();
	}

	public Object get(Object key) {
		return readProperty((String) key);
	}

	public Object put(String key, Object value) {
		writeProperty(key, value);
		return value;
	}

	public Object remove(Object key) {
		Object oldValue = readProperty((String) key);
		writeProperty((String) key, null);
		return oldValue;
	}

	public void putAll(Map<? extends String, ? extends Object> m) {
		for (Map.Entry<? extends String, ? extends Object> entry : m.entrySet()) {
			writeProperty(entry.getKey(), entry.getValue());
		}
	}

	public void clear() {
		for (String property : getPropertySet()) {
			writeProperty(property, null);
		}
	}

	public Set<String> keySet() {
		return getPropertySet();
	}

	public Collection<Object> values() {
		Collection<Object> values = new ArrayList<Object>();
		for (String property : getPropertySet()) {
			values.add(readProperty(property));
		}
		return values;
	}

	public Set<Map.Entry<String, Object>> entrySet() {
		Set<Map.Entry<String, Object>> entrySet = new HashSet<Map.Entry<String, Object>>();
		for (String property : getPropertySet()) {
			entrySet.add(new MapEntry(this, property));
		}
		return entrySet;
	}

}

class MapEntry implements Map.Entry<String, Object> {
	private Map<String, Object> map;
	private String key;

	public MapEntry(Map<String, Object> map, String key) {
		this.map = map;
		this.key = key;
	}

	public String getKey() {
		return key;
	}

	public Object getValue() {
		return map.get(key);
	}

	public Object setValue(Object value) {
		return map.put(key, value);
	}

}
