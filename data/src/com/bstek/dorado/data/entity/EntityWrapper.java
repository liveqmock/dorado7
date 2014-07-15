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

import java.util.Map;
import java.util.Set;

import net.sf.cglib.beans.BeanMap;

import org.aopalliance.intercept.MethodInterceptor;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.util.Assert;

import com.bstek.dorado.data.type.EntityDataType;
import com.bstek.dorado.data.variant.VariantConvertor;
import com.bstek.dorado.data.variant.VariantUtils;
import com.bstek.dorado.util.proxy.MethodInterceptorDispatcher;
import com.bstek.dorado.util.proxy.ProxyBeanUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-12-19
 */
@SuppressWarnings({ "unchecked", "rawtypes" })
public class EntityWrapper {
	private static final Log logger = LogFactory.getLog(EntityWrapper.class);
	private static VariantConvertor variantConvertor;

	private Object entity;
	private Map map;
	private EntityEnhancer entityEnhancer;

	private EntityWrapper(Object entity) {
		setEntity(entity);
	}

	public static EntityWrapper create(Object entity) {
		return new EntityWrapper(entity);
	}

	private static VariantConvertor getVariantConvertor() {
		try {
			variantConvertor = VariantUtils.getVariantConvertor();
		} catch (Exception e) {
			e.printStackTrace();
			logger.error(e, e);
		}
		return variantConvertor;
	}

	public Object getEntity() {
		return entity;
	}

	public void setEntity(Object entity) {
		Assert.notNull(entity);
		this.entity = entity;
		entityEnhancer = getEntityEnhancer();
		if (entityEnhancer == null) {
			if (entity instanceof Map) {
				map = (Map) entity;
			} else {
				map = BeanMap.create(entity);
			}
		}
	}

	private EntityEnhancer getEntityEnhancer() {
		if (ProxyBeanUtils.isProxy(entity)) {
			MethodInterceptorDispatcher dispatcher = ProxyBeanUtils
					.getMethodInterceptorDispatcher(entity);
			if (dispatcher != null) {
				MethodInterceptor[] mis = dispatcher.getSubMethodInterceptors();
				for (MethodInterceptor mi : mis) {
					if (mi instanceof EntityEnhancer) {
						return (EntityEnhancer) mi;
					}
				}
			}
		} else if (entity instanceof EnhanceableEntity) {
			return ((EnhanceableEntity) entity).getEntityEnhancer();
		}
		return null;
	}

	private void throwNotValidEntity() {
		throw new IllegalArgumentException(
				"Wrapped object is not a valid dorado entity.");
	}

	public EntityDataType getDataType() {
		if (entityEnhancer != null) {
			return entityEnhancer.getDataType();
		} else {
			return null;
		}
	}

	public void setDataType(EntityDataType dataType) {
		if (entityEnhancer != null) {
			entityEnhancer.setDataType(dataType);
		} else {
			throwNotValidEntity();
		}
	}

	public Class<?> getPropertyType(String property) {
		if (entityEnhancer != null) {
			return entityEnhancer.getPropertyType(entity, property);
		} else if (map instanceof BeanMap) {
			return ((BeanMap) map).getPropertyType(property);
		} else {
			return null;
		}
	}

	public int getEntityId() {
		if (entityEnhancer != null) {
			return entityEnhancer.getEntityId();
		} else {
			return -1;
		}
	}

	public void setEntityId(int entityId) {
		if (entityEnhancer != null) {
			entityEnhancer.setEntityId(entityId);
		} else {
			throwNotValidEntity();
		}
	}

	public long getTimeStamp() {
		if (entityEnhancer != null) {
			return entityEnhancer.getTimeStamp();
		} else {
			return -1;
		}
	}

	public boolean isLoaded(String property) {
		if (entityEnhancer != null) {
			return entityEnhancer.isLoaded(property);
		} else {
			throwNotValidEntity();
			return false;
		}
	}

	public boolean loadIfNecessary(String property) throws Throwable {
		if (entityEnhancer != null) {
			return entityEnhancer.loadIfNecessary(entity, property);
		} else {
			throwNotValidEntity();
			return false;
		}
	}

	public Object get(String property) {
		return get(property, false);
	}

	public Object getDirectly(String property) {
		return get(property, true);
	}

	protected <T> T get(String property, boolean ignoreInterceptors) {
		Object result = null;
		try {
			if (entityEnhancer != null) {
				result = entityEnhancer.readProperty(entity, property,
						ignoreInterceptors);
			} else {
				result = map.get(property);
			}
			return (T) result;
		} catch (Throwable e) {
			throw new IllegalStateException(e);
		}
	}

	/**
	 * 以String的形式返回数据实体中某属性的值。
	 * 
	 * @param property
	 *            属性名。
	 * @return 值。
	 * @see #getOriginProperty(Object, String)
	 */
	public String getString(String property) {
		Object value = get(property);
		return getVariantConvertor().toString(value);
	}

	/**
	 * 以int的形式返回数据实体中某属性的值。
	 * 
	 * @param entity
	 *            数据实体。
	 * @param property
	 *            属性名。
	 * @return 值。
	 * @see #getOriginProperty(Object, String)
	 */
	public int getInt(String property) {
		Object value = get(property);
		return getVariantConvertor().toInt(value);
	}

	/**
	 * 以long的形式返回数据实体中某属性的值。
	 * 
	 * @param entity
	 *            数据实体。
	 * @param property
	 *            属性名。
	 * @return 值。
	 * @see #getOriginProperty(Object, String)
	 */
	public long getLong(String property) {
		Object value = get(property);
		return getVariantConvertor().toLong(value);
	}

	/**
	 * 以float的形式返回数据实体中某属性的值。
	 * 
	 * @param entity
	 *            数据实体。
	 * @param property
	 *            属性名。
	 * @return 值。
	 * @see #getOriginProperty(Object, String)
	 */
	public float getFloat(String property) {
		Object value = get(property);
		return getVariantConvertor().toFloat(value);
	}

	/**
	 * 以double的形式返回数据实体中某属性的值。
	 * 
	 * @param entity
	 *            数据实体。
	 * @param property
	 *            属性名。
	 * @return 值。
	 * @see #getOriginProperty(Object, String)
	 */
	public double getDouble(String property) {
		Object value = get(property);
		return getVariantConvertor().toDouble(value);
	}

	/**
	 * 以boolean的形式返回数据实体中某属性的值。
	 * 
	 * @param entity
	 *            数据实体。
	 * @param property
	 *            属性名。
	 * @return 值。
	 * @see #getOriginProperty(Object, String)
	 */
	public boolean getBoolean(String property) {
		Object value = get(property);
		return getVariantConvertor().toBoolean(value);
	}

	public void set(String property, Object value) {
		try {
			if (entityEnhancer != null) {
				entityEnhancer.writeProperty(entity, property, value);
			} else {
				map.put(property, value);
			}
		} catch (Throwable e) {
			throw new IllegalStateException(e);
		}
	}

	public void set(Map properties) {
		try {
			if (entityEnhancer != null) {
				for (Map.Entry entry : (Set<Map.Entry>) properties.entrySet()) {
					Object key = entry.getKey();
					if (key instanceof String) {
						entityEnhancer.writeProperty(entity, (String) key,
								entry.getValue());
					}
				}
			} else {
				map.putAll(properties);
			}
		} catch (Throwable e) {
			throw new IllegalStateException(e);
		}
	}

	public EntityState getState() {
		if (entityEnhancer != null) {
			return entityEnhancer.getState();
		} else {
			return EntityState.NONE;
		}
	}

	public void setState(EntityState state) {
		if (entityEnhancer != null) {
			entityEnhancer.setState(state);
		} else {
			throwNotValidEntity();
		}
	}

	public boolean isStateLocked() {
		if (entityEnhancer != null) {
			return entityEnhancer.isStateLocked();
		} else {
			return false;
		}
	}

	public void setStateLocked(boolean locked) {
		if (entityEnhancer != null) {
			entityEnhancer.setStateLocked(locked);
		} else {
			throwNotValidEntity();
		}
	}

	public Set<String> getPropertySet(boolean excludeExProperties) {
		if (entityEnhancer != null) {
			return entityEnhancer.getPropertySet(entity, excludeExProperties);
		} else {
			return map.keySet();
		}
	}

	public Set<String> getPropertySet() {
		return getPropertySet(false);
	}

	public void markDelete() {
		setState(EntityState.DELETED);
	}

	/**
	 * 重置数据实体。<br>
	 * 此操作不仅会重置数据实体为{@link com.bstek.dorado.data.state.EntityState#NONE}，
	 * 同时也将清除先前保存的属性原始值。
	 * 
	 * @param entity
	 *            数据实体。
	 */
	public void resetEntity(Object entity) {
		resetEntity(entity, true);
	}

	public void resetEntity(Object entity, boolean lockState) {
		if (entityEnhancer != null) {
			entityEnhancer.setState(EntityState.NONE);
			entityEnhancer.setStateLocked(lockState);
		} else {
			throwNotValidEntity();
		}
	}

	public boolean hasOldValues() {
		return getOldValues(false) != null;
	}

	public Map<String, Object> getOldValues(boolean create) {
		if (entityEnhancer != null) {
			return entityEnhancer.getOldValues(create);
		} else {
			return null;
		}
	}

	/**
	 * 返回数据实体中某属性的原始值。<br>
	 * 此方法一般仅对状态{@link com.bstek.dorado.data.entity.EntityState#MODIFIED}
	 * 的数据实体有效， 即返回该属性在被修改之前的值。如果该属性并未被修改，那么此方法的返回值应该就是属性当前值。
	 * 
	 * @param property
	 *            属性名。
	 * @return 原始值
	 */
	public <T> T getOldValue(String property) {
		Object value = null;
		if (entityEnhancer != null) {
			Map<String, Object> oldValues = entityEnhancer.getOldValues();
			if (oldValues != null) {
				if (oldValues.containsKey(property)) {
					value = oldValues.get(property);
				} else {
					value = get(property);
				}
			} else {
				throw new IllegalStateException(
						"Entity does not have OldValue.");
			}
		}
		return (T) value;
	}

	/**
	 * 以String的形式返回数据实体中某属性的原始值。
	 * 
	 * @param property
	 *            属性名。
	 * @return 原始值。
	 * @see #getOriginProperty(Object, String)
	 */
	public String getOldString(String property) {
		Object value = getOldValue(property);
		return getVariantConvertor().toString(value);
	}

	/**
	 * 以int的形式返回数据实体中某属性的原始值。
	 * 
	 * @param entity
	 *            数据实体。
	 * @param property
	 *            属性名。
	 * @return 原始值。
	 * @see #getOriginProperty(Object, String)
	 */
	public int getOldInt(String property) {
		Object value = getOldValue(property);
		return getVariantConvertor().toInt(value);
	}

	/**
	 * 以long的形式返回数据实体中某属性的原始值。
	 * 
	 * @param entity
	 *            数据实体。
	 * @param property
	 *            属性名。
	 * @return 原始值。
	 * @see #getOriginProperty(Object, String)
	 */
	public long getOldLong(String property) {
		Object value = getOldValue(property);
		return getVariantConvertor().toLong(value);
	}

	/**
	 * 以float的形式返回数据实体中某属性的原始值。
	 * 
	 * @param entity
	 *            数据实体。
	 * @param property
	 *            属性名。
	 * @return 原始值。
	 * @see #getOriginProperty(Object, String)
	 */
	public float getOldFloat(String property) {
		Object value = getOldValue(property);
		return getVariantConvertor().toFloat(value);
	}

	/**
	 * 以double的形式返回数据实体中某属性的原始值。
	 * 
	 * @param entity
	 *            数据实体。
	 * @param property
	 *            属性名。
	 * @return 原始值。
	 * @see #getOriginProperty(Object, String)
	 */
	public double getOldDouble(String property) {
		Object value = getOldValue(property);
		return getVariantConvertor().toDouble(value);
	}

	/**
	 * 以boolean的形式返回数据实体中某属性的原始值。
	 * 
	 * @param entity
	 *            数据实体。
	 * @param property
	 *            属性名。
	 * @return 原始值。
	 * @see #getOriginProperty(Object, String)
	 */
	public boolean getOldBoolean(String property) {
		Object value = getOldValue(property);
		return getVariantConvertor().toBoolean(value);
	}

}
