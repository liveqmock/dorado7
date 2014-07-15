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
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import net.sf.cglib.beans.BeanMap;

import org.aopalliance.intercept.MethodInterceptor;
import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.lang.ClassUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.util.CollectionUtils;

import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.el.Expression;
import com.bstek.dorado.data.provider.Page;
import com.bstek.dorado.data.type.AggregationDataType;
import com.bstek.dorado.data.type.CustomEntityDataType;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.data.type.EntityDataType;
import com.bstek.dorado.data.type.manager.DataTypeManager;
import com.bstek.dorado.data.variant.Record;
import com.bstek.dorado.data.variant.VariantConvertor;
import com.bstek.dorado.data.variant.VariantUtils;
import com.bstek.dorado.util.proxy.MethodInterceptorDispatcher;
import com.bstek.dorado.util.proxy.ProxyBeanUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-12-20
 */
public abstract class EntityUtils {
	private static final Log logger = LogFactory.getLog(EntityUtils.class);

	private static DataTypeManager dataTypeManager;
	private static EntityProxyMethodInterceptorFactory methodInterceptorFactory;
	private static VariantConvertor variantConvertor;

	private static VariantConvertor getVariantConvertor() {
		try {
			variantConvertor = VariantUtils.getVariantConvertor();
		} catch (Exception e) {
			e.printStackTrace();
			logger.error(e, e);
		}
		return variantConvertor;
	}

	private EntityUtils() {
	}

	private static DataTypeManager getDataTypeManager() throws Exception {
		if (dataTypeManager == null) {
			Context context = Context.getCurrent();
			dataTypeManager = (DataTypeManager) context
					.getServiceBean("dataTypeManager");
		}
		return dataTypeManager;
	}

	private static EntityProxyMethodInterceptorFactory getMethodInterceptorFactory()
			throws Exception {
		if (methodInterceptorFactory == null) {
			Context context = Context.getCurrent();
			methodInterceptorFactory = (EntityProxyMethodInterceptorFactory) context
					.getServiceBean("entityProxyMethodInterceptorFactory");
		}
		return methodInterceptorFactory;
	}

	/**
	 * 判断传入的数据是否是简单的数值。
	 */
	public static boolean isSimpleValue(Object data) {
		boolean b = (data == null || data instanceof String
				|| data.getClass().isPrimitive() || data instanceof Boolean
				|| data instanceof Number || data.getClass().isEnum()
				|| data instanceof Date || data instanceof Character);
		if (!b && data.getClass().isArray()) {
			b = isSimpleType(data.getClass().getComponentType());
		}
		return b;
	}

	/**
	 * 判断传入的数据是否是简单的数值类型。
	 */
	public static boolean isSimpleType(Class<?> cl) {
		boolean b = (String.class.equals(cl) || cl.isPrimitive()
				|| Boolean.class.equals(cl)
				|| Number.class.isAssignableFrom(cl) || cl.isEnum()
				|| Date.class.isAssignableFrom(cl) || Character.class
				.isAssignableFrom(cl));
		if (!b && cl.isArray()) {
			b = isSimpleType(cl.getComponentType());
		}
		return b;
	}

	public static EntityEnhancer getEntityEnhancer(Object entity) {
		if (entity instanceof EnhanceableEntity) {
			EnhanceableEntity enhanceableEntity = (EnhanceableEntity) entity;
			return enhanceableEntity.getEntityEnhancer();
		} else if (ProxyBeanUtils.isProxy(entity)) {
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
		}
		return null;
	}

	public static boolean isEntity(Object entity) {
		if (entity.getClass().isPrimitive()) {
			return false;
		}
		return getEntityEnhancer(entity) != null;
	}

	private static void throwNotValidEntity() {
		throw new IllegalStateException(
				"The object is not a valid dorado entity.");
	}

	private static DataType getDataType(Class<?> type) throws Exception {
		return getDataTypeManager().getDataType(type);
	}

	public static AggregationDataType getDataType(Collection<?> entities) {
		AggregationDataType dataType = null;
		if (entities instanceof EntityCollection<?>) {
			dataType = ((EntityCollection<?>) entities).getDataType();
		}
		return dataType;
	}

	public static EntityDataType getDataType(Object entity) {
		EntityEnhancer entityEnhancer = getEntityEnhancer(entity);
		if (entityEnhancer != null) {
			return entityEnhancer.getDataType();
		} else {
			return null;
		}
	}

	public static EntityState getState(Object entity) {
		EntityEnhancer entityEnhancer = getEntityEnhancer(entity);
		if (entityEnhancer != null) {
			return entityEnhancer.getState();
		} else {
			return EntityState.NONE;
		}
	}

	public static void setState(Object entity, EntityState state) {
		EntityEnhancer entityEnhancer = getEntityEnhancer(entity);
		if (entityEnhancer != null) {
			entityEnhancer.setState(state);
		} else {
			throwNotValidEntity();
		}
	}

	public static boolean isDirty(Object entity) {
		EntityEnhancer entityEnhancer = getEntityEnhancer(entity);
		if (entityEnhancer != null) {
			return entityEnhancer.getState() != EntityState.NONE;
		} else {
			return false;
		}
	}

	public static boolean isCascadeDirty(Object entity) throws Exception {
		EntityEnhancer entityEnhancer = getEntityEnhancer(entity);
		if (entityEnhancer != null) {
			if (entityEnhancer.getState() != EntityState.NONE) {
				return true;
			} else {
				try {
					boolean isDirty;
					for (String property : entityEnhancer.getPropertySet(
							entity, false)) {
						Object value = entityEnhancer.readProperty(entity,
								property, true);
						if (value != null) {
							if (isEntity(value)) {
								isDirty = isCascadeDirty(value);
								if (isDirty) {
									return true;
								}
							} else if (value instanceof Collection<?>) {
								for (Object e : (Collection<?>) value) {
									isDirty = isCascadeDirty(e);
									if (isDirty) {
										return true;
									}
								}
							} else if (value instanceof Page<?>) {
								for (Object e : ((Page<?>) value).getEntities()) {
									isDirty = isCascadeDirty(e);
									if (isDirty) {
										return true;
									}
								}
							}
						}
					}
					return false;
				} catch (Exception e) {
					throw e;
				} catch (Throwable t) {
					throw new IllegalStateException(t);
				}
			}
		} else {
			return false;
		}
	}

	public static <T> T newEntity(Class<? extends T> type) throws Exception {
		return (T) newEntity(type, null);
	}

	@SuppressWarnings("unchecked")
	public static <T> T newEntity(EntityDataType entityDataType)
			throws Exception {
		Class<?> creationType = entityDataType.getCreationType();
		if (creationType == null) {
			creationType = entityDataType.getMatchType();
		}
		if (creationType == null) {
			creationType = Record.class;
		}
		return (T) newEntity(creationType, entityDataType);
	}

	public static <T> T newEntity(Class<? extends T> type,
			EntityDataType entityDataType) throws Exception {
		T object = type.newInstance();
		T entity = toEntity(object, entityDataType);
		EntityEnhancer entityEnhancer = getEntityEnhancer(entity);
		entityEnhancer.setState(EntityState.NEW);
		return entity;
	}

	public static void deleteEntity(Object entity) throws Exception {
		EntityEnhancer entityEnhancer = getEntityEnhancer(entity);
		if (entityEnhancer != null) {
			entityEnhancer.setState(EntityState.DELETED);
		} else {
			throwNotValidEntity();
		}
	}

	@SuppressWarnings("unchecked")
	public static <T> T toEntity(Object object) throws Exception {
		return (T) toEntity(object, null);
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public static <T> T toEntity(Object object, DataType dataType)
			throws Exception {
		if (isSimpleValue(object)) {
			return (T) object;
		}

		// 如果是Expression则首先对其进行求值
		if (object instanceof Expression) {
			object = ((Expression) object).evaluate();
		}

		Class<?> cl = object.getClass();
		if (object instanceof Collection) {
			Collection<?> entities = (Collection<?>) object;
			if (entities instanceof EntityCollection<?>) {
				DataType currentDataType = getDataType(entities);
				if (currentDataType != dataType && dataType != null) {
					((EntityCollection<?>) entities)
							.setDataType((AggregationDataType) dataType);
				}
				return (T) object;
			}
		} else {
			EntityEnhancer entityEnhancer = getEntityEnhancer(object);
			if (entityEnhancer != null) {
				DataType currentDataType = entityEnhancer.getDataType();
				if (currentDataType != dataType && dataType != null) {
					entityEnhancer.setDataType((EntityDataType) dataType);
				}
				return (T) object;
			}
		}

		boolean useProxy = true;
		if (dataType == null) {
			dataType = getDataType(cl);
		}

		if (dataType != null) {
			Class<?> matchType = dataType.getMatchType();
			if (matchType != null) {
				boolean matching = false;
				if (matchType.isPrimitive()) {
					matching = ClassUtils.primitiveToWrapper(matchType).equals(
							cl);
				} else {
					matching = matchType.isAssignableFrom(cl);
				}
				if (!matching) {
					if (dataType instanceof EntityDataType) {
						DataType realDataType = getDataType(cl);
						if (realDataType instanceof EntityDataType) {
							matching = true;
							useProxy = false;
						}
					} else if (dataType instanceof AggregationDataType) {
						DataType realDataType = getDataType(cl);
						if (realDataType instanceof AggregationDataType) {
							matching = true;
						}
					}

					if (!matching) {
						throw new IllegalArgumentException(
								"Result type mismatch. expect [" + matchType
										+ "] but [" + cl + "].");
					}
				}
			}
		}

		if (object instanceof Collection) {
			// 如果是Collection则认为需要动态代理
			AggregationDataType AggregationDataType = (AggregationDataType) dataType;
			if (object instanceof List) {
				object = new EntityList((List) object, AggregationDataType);
			} else if (object instanceof Set) {
				object = new EntitySet((Set) object, AggregationDataType);
			} else {
				throw new IllegalArgumentException("Unsupported result type ["
						+ cl.getName() + "].");
			}
		} else if (object.getClass().isArray()) {
			Class type = object.getClass();
			if (isSimpleType(type.getComponentType())) {
				return (T) object;
			} else {
				// 对于数组自动转换成java.util.List
				logger.warn("Dorado converted a " + object.getClass() + " to "
						+ List.class + " automatically.");

				List list = CollectionUtils.arrayToList(object);
				object = new EntityList(list, (AggregationDataType) dataType);
			}
		} else {
			// TODO 对Entity的是否需要动态代理的判断
			// 如果是Entity则认为需要动态代理
			EntityDataType entityDataType = (EntityDataType) dataType;
			if (!(entityDataType instanceof CustomEntityDataType)) {
				if (useProxy) {
					// 对于那些本身的类型就与目标类型匹配的数据实体，创建一个新的动态代理实例。
					if (object instanceof EnhanceableEntity) {
						EnhanceableEntity enhanceableEntity = (EnhanceableEntity) object;
						if (enhanceableEntity.getEntityEnhancer() == null) {
							EntityEnhancer entityEnhancer;
							if (object instanceof Map) {
								entityEnhancer = new EnhanceableMapEntityEnhancer(
										entityDataType);
							} else {
								entityEnhancer = new EnhanceableBeanEntityEnhancer(
										entityDataType, object.getClass());
							}
							enhanceableEntity.setEntityEnhancer(entityEnhancer);
						}
						return (T) object;
					} else {
						MethodInterceptor[] mis = getMethodInterceptorFactory()
								.createInterceptors(entityDataType,
										object.getClass(), object);
						object = ProxyBeanUtils.proxyBean(object, mis);
					}
				} else {
					// 对于那些本身的类型与目标类型不匹配的数据实体，创建一个全新的实例并复制所有实体属性。
					Class<?> creationType = entityDataType.getCreationType();
					if (creationType == null) {
						creationType = entityDataType.getMatchType();
					}

					Map map;
					if (object instanceof Map) {
						map = (Map) object;
					} else {
						map = BeanMap.create(object);
					}

					if (creationType == null) {
						Record record = new Record(map);
						record.setEntityEnhancer(new EnhanceableMapEntityEnhancer(
								entityDataType));
						object = record;
					} else {
						MethodInterceptor[] mis = getMethodInterceptorFactory()
								.createInterceptors(entityDataType,
										creationType, null);
						object = ProxyBeanUtils.createBean(creationType, mis);
						setValues(object, map);
					}
				}
			} else {
				object = ((CustomEntityDataType) entityDataType).toMap(object);
			}
		}
		return (T) object;
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public static <T> T toPureData(Object entity) throws Exception {
		if (isSimpleValue(entity)) {
			return (T) entity;
		}

		// !isEntity(object)
		if (entity instanceof Collection) {
			List list = new ArrayList();
			for (Object e : (Collection) entity) {
				if (EntityUtils.getState(e) != EntityState.DELETED) {
					list.add(toPureData(e));
				}
			}
			return (T) list;
		} else {
			T object;
			EntityEnhancer entityEnhancer = getEntityEnhancer(entity);
			if (entityEnhancer != null) {
				Map newMap;
				Set<String> propertySet;

				if (entityEnhancer instanceof BeanEntityEnhancer) {
					Class<?> beanType = ((BeanEntityEnhancer) entityEnhancer)
							.getBeanType();
					object = (T) beanType.newInstance();
					newMap = BeanMap.create(object);
					propertySet = entityEnhancer.getPropertySet(entity, false);
				} else {
					newMap = new HashMap();
					object = (T) newMap;
					propertySet = entityEnhancer.getPropertySet(entity, true);
				}

				try {
					for (String property : propertySet) {
						Object value = entityEnhancer.readProperty(entity,
								property, false);
						if (!isSimpleValue(value)) {
							value = toPureData(value);
						}
						newMap.put(property, value);
					}
				} catch (Exception e) {
					throw e;
				} catch (Throwable t) {
					throw new IllegalStateException(t);
				}
			} else {
				Map oldMap, newMap;
				if (entity instanceof Map) {
					oldMap = (Map) entity;
					newMap = new HashMap();
					object = (T) newMap;
				} else {
					oldMap = BeanMap.create(entity);
					object = (T) entity.getClass().newInstance();
					newMap = BeanMap.create(object);
				}
				newMap.putAll(oldMap);
			}
			return object;
		}
	}

	public static void markDeleted(Object entity) {
		EntityEnhancer entityEnhancer = getEntityEnhancer(entity);
		if (entityEnhancer != null) {
			entityEnhancer.setState(EntityState.DELETED);
		} else {
			throwNotValidEntity();
		}
	}

	/**
	 * 重置数据实体。<br>
	 * 此操作不仅会重置数据实体为{@link com.bstek.dorado.data.state.EntityState#NONE}，
	 * 同时也将清除先前保存的属性原始值。
	 * 
	 * @param entity
	 *            数据实体。
	 */
	public static void resetEntity(Object entity) {
		resetEntity(entity, true);
	}

	public static void resetEntity(Object entity, boolean lockState) {
		EntityEnhancer entityEnhancer = getEntityEnhancer(entity);
		if (entityEnhancer != null) {
			if (entityEnhancer.getState() != EntityState.DELETED) {
				entityEnhancer.setState(EntityState.NONE);
			}
			entityEnhancer.clearOldValues();
			if (lockState) {
				entityEnhancer.setStateLocked(true);
			}
		} else {
			throwNotValidEntity();
		}
	}

	/**
	 * 重置一组数据实体。
	 * 
	 * @param entities
	 *            数据实体的集合。
	 * @see #resetEntity(Object)
	 */
	public static void resetEntities(Collection<?> entities) {
		resetEntities(entities, true);
	}

	public static void resetEntities(Collection<?> entities, boolean lockState) {
		for (Object o : entities) {
			resetEntity(o, lockState);
		}
	}

	/**
	 * 返回一个具有筛选功能的数据实体迭代器。
	 * 
	 * @param entities
	 *            数据实体的集合。
	 * @param filter
	 *            筛选方式。
	 * @return 迭代器。
	 */
	@SuppressWarnings({ "unchecked", "rawtypes" })
	public static Iterator getIterator(Collection entities,
			FilterType filterType) {
		return new EntityIterator(entities, filterType);
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public static <E> Iterator<E> getIterator(Collection entities,
			FilterType filterType, Class<E> cl) {
		return new EntityIterator<E>(entities, filterType);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static Iterable getIterable(Collection entities,
			FilterType filterType) {
		return new EntityIterator(entities, filterType);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static <E> Iterable<E> getIterable(Collection entities,
			FilterType filterType, Class<E> cl) {
		return new EntityIterator<E>(entities, filterType);
	}

	public static boolean isLoaded(Object entity, String property) {
		EntityEnhancer entityEnhancer = getEntityEnhancer(entity);
		if (entityEnhancer != null) {
			return entityEnhancer.isLoaded(property);
		} else {
			throwNotValidEntity();
			return false;
		}
	}

	public static boolean loadIfNecessary(Object entity, String property)
			throws Exception {
		EntityEnhancer entityEnhancer = getEntityEnhancer(entity);
		if (entityEnhancer != null) {
			try {
				return entityEnhancer.loadIfNecessary(entity, property);
			} catch (Exception e) {
				throw e;
			} catch (Throwable e) {
				throw new IllegalStateException(e);
			}
		} else {
			throwNotValidEntity();
			return false;
		}
	}

	@SuppressWarnings("unchecked")
	private static <T> T getValue(Object entity, String property,
			boolean ignoreInterceptors) {
		EntityEnhancer entityEnhancer = getEntityEnhancer(entity);
		if (entityEnhancer != null) {
			try {
				return (T) entityEnhancer.readProperty(entity, property,
						ignoreInterceptors);
			} catch (Throwable e) {
				throw new IllegalStateException(e);
			}
		} else {
			throwNotValidEntity();
			return null;
		}
	}

	@SuppressWarnings("unchecked")
	public static <T> T getValue(Object entity, String property) {
		return (T) getValue(entity, property, false);
	}

	public static String getString(Object entity, String property) {
		Object value = getValue(entity, property);
		return getVariantConvertor().toString(value);
	}

	public static int getInt(Object entity, String property) {
		Object value = getValue(entity, property);
		return getVariantConvertor().toInt(value);
	}

	public static long getLong(Object entity, String property) {
		Object value = getValue(entity, property);
		return getVariantConvertor().toLong(value);
	}

	public static float getFloat(Object entity, String property) {
		Object value = getValue(entity, property);
		return getVariantConvertor().toFloat(value);
	}

	public static double getDouble(Object entity, String property) {
		Object value = getValue(entity, property);
		return getVariantConvertor().toDouble(value);
	}

	public static boolean getBoolean(Object entity, String property) {
		Object value = getValue(entity, property);
		return getVariantConvertor().toBoolean(value);
	}

	public static void setValue(Object entity, String property, Object value) {
		EntityEnhancer entityEnhancer = getEntityEnhancer(entity);
		if (entityEnhancer != null) {
			try {
				entityEnhancer.writeProperty(entity, property, value);
			} catch (Throwable e) {
				throw new IllegalStateException(e);
			}
		} else {
			throwNotValidEntity();
		}
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public static void setValues(Object entity, Map properties) {
		EntityEnhancer entityEnhancer = getEntityEnhancer(entity);
		if (entityEnhancer != null) {
			try {
				for (Map.Entry entry : (Set<Map.Entry>) properties.entrySet()) {
					Object property = entry.getKey();
					if (property instanceof String) {
						entityEnhancer.writeProperty(entity, (String) property,
								entry.getValue());
					}
				}
			} catch (Throwable e) {
				throw new IllegalStateException(e);
			}
		} else {
			throwNotValidEntity();
		}
	}

	public static boolean hasOldValues(Object entity) {
		EntityEnhancer entityEnhancer = getEntityEnhancer(entity);
		if (entityEnhancer != null) {
			return entityEnhancer.getOldValues() != null;
		} else {
			return false;
		}
	}

	@SuppressWarnings("unchecked")
	public static <T> T getOldValue(Object entity, String property) {
		Object value = null;
		EntityEnhancer entityEnhancer = getEntityEnhancer(entity);
		if (entityEnhancer != null) {
			Map<String, Object> oldValues = entityEnhancer.getOldValues();
			if (oldValues != null) {
				if (oldValues.containsKey(property)) {
					value = oldValues.get(property);
				} else {
					value = getValue(entity, property);
				}
			} else {
				value = getValue(entity, property);
			}
		}
		return (T) value;
	}

	public static String getOldString(Object entity, String property) {
		Object value = getOldValue(entity, property);
		return getVariantConvertor().toString(value);
	}

	public static int getOldInt(Object entity, String property) {
		Object value = getOldValue(entity, property);
		return getVariantConvertor().toInt(value);
	}

	public static long getOldLong(Object entity, String property) {
		Object value = getOldValue(entity, property);
		return getVariantConvertor().toLong(value);
	}

	public static float getOldFloat(Object entity, String property) {
		Object value = getOldValue(entity, property);
		return getVariantConvertor().toFloat(value);
	}

	public static double getOldDouble(Object entity, String property) {
		Object value = getOldValue(entity, property);
		return getVariantConvertor().toDouble(value);
	}

	public static boolean getOldBoolean(Object entity, String property) {
		Object value = getOldValue(entity, property);
		return getVariantConvertor().toBoolean(value);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static void copyProperties(Object target, Object source)
			throws Exception {
		try {
			EntityEnhancer sourceEnhancer = getEntityEnhancer(source);
			EntityEnhancer targetEnhancer = getEntityEnhancer(target);

			Map targetMap = null;
			if (targetEnhancer == null) {
				if (target instanceof Map) {
					targetMap = (Map) target;
				} else {
					targetMap = BeanMap.create(target);
				}
			}

			if (sourceEnhancer != null) {
				for (String property : sourceEnhancer.getPropertySet(target,
						false)) {
					Object value = sourceEnhancer.readProperty(source,
							property, false);
					if (targetEnhancer != null) {
						targetEnhancer.writeProperty(target, property, value);
					} else {
						targetMap.put(property, value);
					}
				}
			} else if (targetEnhancer != null) {
				Map sourceMap;
				if (source instanceof Map) {
					sourceMap = (Map) source;
				} else {
					sourceMap = BeanMap.create(source);
				}

				for (Object property : sourceMap.keySet()) {
					targetEnhancer.writeProperty(source, (String) property,
							sourceMap.get(property));
				}
			}else {
				BeanUtils.copyProperties(target, source);
			}
		} catch (Exception e) {
			throw e;
		} catch (Throwable t) {
			throw new IllegalStateException(t);
		}
	}

}
