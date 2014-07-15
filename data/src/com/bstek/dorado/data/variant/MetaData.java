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

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.data.entity.EnhanceableEntity;
import com.bstek.dorado.data.entity.EntityEnhancer;
import com.bstek.dorado.data.type.EntityDataType;

/**
 * 元数据对象。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apirl 20, 2007
 */
public class MetaData extends HashMap<String, Object> implements VariantSet,
		EnhanceableEntity {
	private static final long serialVersionUID = -5206947024602715722L;
	private static final Log logger = LogFactory.getLog(MetaData.class);
	private static VariantConvertor variantConvertor;

	private EntityEnhancer entityEnhancer;

	public MetaData() {
	}

	public MetaData(Map<String, ?> map) {
		super(map);
	}

	private static VariantConvertor getVariantConvertor() {
		try {
			variantConvertor = VariantUtils.getVariantConvertor();
		} catch (Exception e) {
			logger.error(e, e);
		}
		return variantConvertor;
	}

	public EntityEnhancer getEntityEnhancer() {
		return entityEnhancer;
	}

	public void setEntityEnhancer(EntityEnhancer entityEnhancer) {
		this.entityEnhancer = entityEnhancer;
	}

	public Object internalReadProperty(String property) throws Exception {
		return super.get(property);
	}

	public void internalWriteProperty(String property, Object value)
			throws Exception {
		super.put(property, value);
	}

	@Override
	public Object get(Object key) {
		if (entityEnhancer != null) {
			Object result = null;
			try {
				result = entityEnhancer.readProperty(this, (String) key, false);
			} catch (Throwable e) {
				logger.warn(e, e);
			}
			return result;
		} else {
			return super.get(key);
		}
	}

	@Override
	public Object put(String key, Object value) {
		if (entityEnhancer != null) {
			Object result = super.get(key);
			try {
				entityEnhancer.writeProperty(this, key, value);
			} catch (Throwable e) {
				logger.warn(e, e);
			}
			return result;
		} else {
			return super.put(key, value);
		}
	}

	@Override
	public int size() {
		if (entityEnhancer != null) {
			Map<String, Object> exProperties = entityEnhancer.getExProperties();
			if (exProperties != null) {
				return super.size() + exProperties.size();
			}
		}
		return super.size();
	}

	@Override
	public boolean isEmpty() {
		boolean isEmpty = super.isEmpty();
		if (!isEmpty) {
			return false;
		}

		if (entityEnhancer != null) {
			Map<String, Object> exProperties = entityEnhancer.getExProperties();
			if (exProperties != null) {
				return exProperties.isEmpty();
			}
		}
		return true;
	}

	@Override
	public boolean containsKey(Object key) {
		boolean contains = super.containsKey(key);
		if (contains) {
			return true;
		}

		if (entityEnhancer != null) {
			Map<String, Object> exProperties = entityEnhancer.getExProperties();
			if (exProperties != null) {
				return exProperties.containsKey(key);
			}
		}
		return false;
	}

	@Override
	public Object remove(Object key) {
		if (entityEnhancer != null) {
			Map<String, Object> exProperties = entityEnhancer.getExProperties();
			if (exProperties != null && exProperties.containsKey(key)) {
				Object result = null;
				try {
					result = entityEnhancer.readProperty(this, (String) key, false);
				} catch (Throwable e) {
					logger.warn(e, e);
				}
				exProperties.remove(key);
				return result;
			} else {
				throw new UnsupportedOperationException();
			}
		} else {
			return super.remove(key);
		}
	}

	@Override
	public void clear() {
		if (entityEnhancer != null) {
			EntityDataType dataType = entityEnhancer.getDataType();
			if (dataType != null && !dataType.getPropertyDefs().isEmpty()) {
				throw new UnsupportedOperationException();
			}

			Map<String, Object> exProperties = entityEnhancer.getExProperties();
			if (exProperties != null) {
				exProperties.clear();
			}
		} else {
			super.clear();
		}
	}

	@Override
	public boolean containsValue(Object value) {
		if (entityEnhancer != null) {
			for (Entry<String, Object> entry : doGetEntrySet()) {
				if (ObjectUtils.equals(value, entry.getValue())) {
					return true;
				}
			}
			return false;
		} else {
			return super.containsValue(value);
		}
	}

	@Override
	public Object clone() {
		if (entityEnhancer != null) {
			MetaData cloned = new MetaData();
			for (Entry<String, Object> entry : doGetEntrySet()) {
				cloned.put(entry.getKey(), entry.getValue());
			}
			return cloned;
		} else {
			return super.clone();
		}
	}

	@Override
	public Set<String> keySet() {
		if (entityEnhancer != null) {
			Map<String, Object> exProperties = entityEnhancer.getExProperties();
			if (exProperties != null) {
				Set<String> keySet = new HashSet<String>(super.keySet());
				keySet.addAll(exProperties.keySet());
				return keySet;
			} else {
				return super.keySet();
			}
		} else {
			return super.keySet();
		}
	}

	@Override
	public Collection<Object> values() {
		List<Object> values = new ArrayList<Object>();
		for (Entry<String, Object> entry : doGetEntrySet()) {
			values.add(entry.getValue());
		}
		return values;
	}

	@Override
	public Set<Entry<String, Object>> entrySet() {
		if (entityEnhancer != null) {
			return doGetEntrySet();
		} else {
			return super.entrySet();
		}
	}

	protected Set<Entry<String, Object>> doGetEntrySet() {
		Set<Entry<String, Object>> entrySet = new HashSet<Entry<String, Object>>();
		for (String property : keySet()) {
			MapEntry entry = new MapEntry(this, property);
			entrySet.add(entry);
		}
		return Collections.unmodifiableSet(entrySet);
	}

	public String getString(String key) {
		return getVariantConvertor().toString(super.get(key));
	}

	public void setString(String key, String s) {
		put(key, s);
	}

	public boolean getBoolean(String key) {
		return getVariantConvertor().toBoolean(super.get(key));
	}

	public void setBoolean(String key, boolean b) {
		put(key, Boolean.valueOf(b));
	}

	public int getInt(String key) {
		return getVariantConvertor().toInt(super.get(key));
	}

	public void setInt(String key, int i) {
		put(key, new Integer(i));
	}

	public long getLong(String key) {
		return getVariantConvertor().toLong(super.get(key));
	}

	public void setLong(String key, long l) {
		put(key, new Long(l));
	}

	public float getFloat(String key) {
		return getVariantConvertor().toFloat(super.get(key));
	}

	public void setFloat(String key, float f) {
		put(key, new Float(f));
	}

	public double getDouble(String key) {
		return getVariantConvertor().toDouble(super.get(key));
	}

	public void setDouble(String key, double d) {
		put(key, new Double(d));
	}

	public BigDecimal getBigDecimal(String key) {
		return getVariantConvertor().toBigDecimal(super.get(key));
	}

	public void setBigDecimal(String key, BigDecimal bd) {
		put(key, bd);
	}

	public Date getDate(String key) {
		return getVariantConvertor().toDate(super.get(key));
	}

	public void setDate(String key, Date date) {
		put(key, date);
	}

	public Object get(String key) {
		return super.get(key);
	}

	public void set(String key, Object value) {
		put(key, value);
	}

	public Map<String, Object> toMap() {
		return this;
	}
}

class MapEntry implements Map.Entry<String, Object> {
	private MetaData metaData;
	private String key;

	public MapEntry(MetaData metaData, String key) {
		this.metaData = metaData;
		this.key = key;
	}

	public String getKey() {
		return key;
	}

	public Object getValue() {
		return metaData.get(key);
	}

	public Object setValue(Object value) {
		return metaData.put(key, value);
	}

}
