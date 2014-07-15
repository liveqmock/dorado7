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

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import net.sf.cglib.beans.BeanMap;

import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.jexl2.JexlContext;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.el.ExpressionHandler;
import com.bstek.dorado.core.resource.ResourceManager;
import com.bstek.dorado.core.resource.ResourceManagerUtils;
import com.bstek.dorado.data.provider.DataProvider;
import com.bstek.dorado.data.type.CustomEntityDataType;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.data.type.EntityDataType;
import com.bstek.dorado.data.type.property.BasePropertyDef;
import com.bstek.dorado.data.type.property.CacheMode;
import com.bstek.dorado.data.type.property.LazyPropertyDef;
import com.bstek.dorado.data.type.property.PropertyDef;
import com.bstek.dorado.data.type.property.Reference;
import com.bstek.dorado.data.type.validator.Validator;

/*
 * 关于PropertyPath的备忘： 1.
 * PropertyPath只对BasePropertyDef有效，且只对isKey=false的BasePropertyDef有效。 2.
 * PropertyPath的计算结果不会被缓存，但是系统会确保其结果在返回时的DataType与PropertyDef中的定义一致。 3.
 * PropertyPath的第一段不能与所属的PropertyDef.name重名，每一片段的返回结果都不能与当前数据实体相同。
 */

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-12-19
 */
public abstract class EntityEnhancer {
	private static final ResourceManager resourceManager = ResourceManagerUtils
			.get(EntityEnhancer.class);

	private static final Log logger = LogFactory.getLog(EntityEnhancer.class);
	private static final String THIS = "this";

	protected static final Object UNDISPOSED_VALUE = new Object();

	private static ExpressionHandler expressionHandler;

	private static int maxEntityId = 0;
	private static long maxTimeStamp = 0;
	private static GetterInterceptionInjector injector = new GetterInterceptionInjector();

	private Set<String> propertiesHasRead;

	protected EntityDataType dataType;
	private int entityId;
	private long timeStamp;
	private EntityState state = EntityState.NONE;
	private boolean stateLocked = false;
	private Map<String, Object> exProperties;
	private Map<String, Object> oldValues;

	public EntityEnhancer(EntityDataType dataType) {
		setDataType(dataType);
	}

	public void setDataType(EntityDataType dataType) {
		this.dataType = dataType;
	}

	public EntityDataType getDataType() {
		return dataType;
	}

	private static ExpressionHandler getExpressionHandler() throws Exception {
		if (expressionHandler == null) {
			Context context = Context.getCurrent();
			expressionHandler = (ExpressionHandler) context
					.getServiceBean("expressionHandler");
		}
		return expressionHandler;
	}

	/**
	 * 禁用dorado对数据实体中属性的read方法的动态代理。<br>
	 * 注意，此方法并不禁止对EL表达式进行求值的动态代理。
	 */
	public static void disableGetterInterception() {
		injector.disableGetterInterception();
	}

	/**
	 * 启用dorado对数据实体中属性的read方法的动态代理。
	 */
	public static void enableGetterInterception() {
		injector.resetHasPropertyResultSkiped();
		injector.enableGetterInterception();
	}

	/**
	 * 是否禁用了数据实体中属性的read方法中的部分动态代理。
	 */
	public static boolean isGetterInterceptionDisabled() {
		return injector.isGetterInterceptionDisabled();
	}

	/**
	 * 返回最后一次读取实体对象属性时是否发生了属性方法拦截器被跳过的现象。
	 */
	public static boolean hasGetterResultSkiped() {
		return injector.hasPropertyResultSkiped();
	}

	/**
	 * 设置发生了属性方法拦截器被跳过的标志。
	 */
	public static void setHasGetterResultSkiped() {
		injector.setHasPropertyResultSkiped();
	}

	/**
	 * 重置用于标识是否发生了属性方法拦截器被跳过的标志。
	 */
	public static void resetHasPropertyResultSkiped() {
		injector.resetHasPropertyResultSkiped();
	}

	public static synchronized int newEntityId() {
		if (maxEntityId >= (Integer.MAX_VALUE - 1)) {
			maxEntityId = 0;
		}
		return ++maxEntityId;
	}

	public static long getLastTimeStamp() {
		return maxTimeStamp;
	}

	public static synchronized long newTimeStamp() {
		if (maxTimeStamp >= (Long.MAX_VALUE - 1)) {
			maxTimeStamp = 0;
		}
		return ++maxTimeStamp;
	}

	public int getEntityId() {
		return entityId;
	}

	public void setEntityId(int entityId) {
		this.entityId = entityId;
	}

	public long getTimeStamp() {
		return timeStamp;
	}

	public void setTimeStamp(long timeStamp) {
		this.timeStamp = timeStamp;
	}

	public EntityState getState() {
		return state;
	}

	public void setState(EntityState state) {
		this.state = state;
	}

	public boolean isStateLocked() {
		return stateLocked;
	}

	public void setStateLocked(boolean stateLocked) {
		this.stateLocked = stateLocked;
	}

	protected abstract Set<String> doGetPropertySet(Object entity,
			boolean excludeExProperties);

	public Set<String> getPropertySet(Object entity, boolean excludeExProperties) {
		if (dataType == null || dataType.isAcceptUnknownProperty()) {
			return doGetPropertySet(entity, excludeExProperties);
		} else {
			return dataType.getPropertyDefs().keySet();
		}
	}

	protected Map<String, Object> getExProperties(boolean create) {
		if (exProperties == null && create) {
			exProperties = new HashMap<String, Object>();
		}
		return exProperties;
	}

	public Map<String, Object> getExProperties() {
		return exProperties;
	}

	/**
	 * 返回原始值的Map集合。该Map中的键值为属性名，值为相应的原始值。
	 * 
	 * @param create
	 *            如果原始值集合上不存在，则创建一个全新的原始值集合。
	 */
	public Map<String, Object> getOldValues(boolean create) {
		if (oldValues == null && create) {
			oldValues = new HashMap<String, Object>();
		}
		return oldValues;
	}

	/**
	 * 返回原始值的Map集合。该Map中的键值为属性名，值为相应的原始值。
	 */
	public Map<String, Object> getOldValues() {
		return oldValues;
	}

	/**
	 * 清除当前保存的所有初始值。
	 */
	public void clearOldValues() {
		oldValues = null;
	}

	public boolean isLoaded(String property) {
		if (dataType != null) {
			PropertyDef propertyDef = dataType.getPropertyDef(property);
			if (propertyDef != null && propertyDef instanceof LazyPropertyDef) {
				return isPropertyHasRead(property);
			} else {
				throw new IllegalArgumentException("Property \"" + property
						+ "\" does not exists or is not \"LazyPropertyDef\".");
			}
		} else {
			throw new IllegalArgumentException("DataType undefined.");
		}
	}

	public boolean loadIfNecessary(Object entity, String property)
			throws Throwable {
		if (dataType != null) {
			PropertyDef propertyDef = dataType.getPropertyDef(property);
			if (propertyDef != null && propertyDef instanceof LazyPropertyDef) {
				boolean hasRead = isPropertyHasRead(property);
				if (hasRead) {
					EntityEnhancer.enableGetterInterception();
					try {
						readProperty(entity, property, false);
					} finally {
						EntityEnhancer.disableGetterInterception();
					}
				}
				return !hasRead;
			} else {
				throw new IllegalArgumentException("Property \"" + property
						+ "\" does not exists or is not \"LazyPropertyDef\".");
			}
		} else {
			throw new IllegalArgumentException("DataType undefined.");
		}
	}

	protected void markPropertyHasRead(String property) {
		if (propertiesHasRead == null) {
			propertiesHasRead = new HashSet<String>();
		}
		propertiesHasRead.add(property);
	}

	protected boolean isPropertyHasRead(String property) {
		return (propertiesHasRead == null) ? false : propertiesHasRead
				.contains(property);
	}

	protected abstract Object internalReadProperty(Object entity,
			String property) throws Exception;

	protected abstract void internalWriteProperty(Object entity,
			String property, Object value) throws Exception;

	protected final Object internalReadProperty(Object entity, String property,
			boolean isExProp) throws Exception {
		if (isExProp) {
			Map<String, Object> exProperties = getExProperties(false);
			return (exProperties != null) ? exProperties.get(property) : null;
		} else {
			return internalReadProperty(entity, property);
		}
	}

	protected final void internalWriteProperty(Object entity, String property,
			Object value, boolean isExProp) throws Exception {
		if (isExProp) {
			getExProperties(true).put(property, value);
		} else {
			internalWriteProperty(entity, property, value);
		}
	}

	protected Object interceptReadMethod(Object entity, String property,
			Object originResult, boolean isExProp) throws Throwable {
		Object result = originResult;
		if (dataType != null) {
			PropertyDef propertyDef = dataType.getPropertyDef(property);
			if (propertyDef != null) {
				DataType propertyDataType = propertyDef.getDataType();
				if (entity instanceof Map || propertyDataType == null
						|| !(propertyDataType instanceof CustomEntityDataType)) {
					LazyPropertyDef lazyPropertyDef = null;
					String propertyPath = null;
					if (propertyDef instanceof LazyPropertyDef) {
						lazyPropertyDef = (LazyPropertyDef) propertyDef;
						if (result == null
								&& !isPropertyHasRead(property)
								|| lazyPropertyDef != null
								&& !CacheMode
										.isCacheableAtServerSide(lazyPropertyDef
												.getCacheMode())) {
							result = readPropertyDef(entity, propertyDef,
									originResult);
						}
					} else {
						BasePropertyDef basePropertyDef = (BasePropertyDef) propertyDef;
						propertyPath = basePropertyDef.getPropertyPath();
						if (StringUtils.isNotEmpty(propertyPath)) {
							validatePropertyPath(basePropertyDef);
							result = PropertyPathUtils.getValueByPath(dataType,
									entity, propertyPath);
						}
					}

					if (!isGetterInterceptionDisabled()) {
						if (result != null) {
							Object proxy = EntityUtils.toEntity(result,
									propertyDataType);
							if ((originResult == null || proxy != result)
									&& StringUtils.isEmpty(propertyPath)) {
								synchronized (this) {
									boolean originLocked = isStateLocked();
									setStateLocked(true);
									try {
										internalWriteProperty(entity, property,
												proxy, isExProp);
									} finally {
										setStateLocked(originLocked);
									}
								}
							}
							result = proxy;
						}

						markPropertyHasRead(property);
					}
				}
			}
		}
		return result;
	}

	private void validatePropertyPath(BasePropertyDef propertyDef)
			throws Exception {
		String propertyPath = propertyDef.getPropertyPath();
		String name = propertyDef.getName();
		if (propertyPath.equals(name) || propertyPath.startsWith(name + '.')) {
			throw new IllegalArgumentException(resourceManager.getString(
					"dorado.common/invalidatePropertyPath", name, propertyPath));
		}
	}

	protected boolean interceptWriteMethod(Object entity, String property,
			Object newValue, boolean isExProp) throws Exception {
		PropertyDef propertyDef = null;
		if (dataType != null) {
			propertyDef = dataType.getPropertyDef(property);
		}

		if (!isStateLocked()) {
			EntityState state = getState();
			if (propertyDef == null) {
				// TODO: 是否要在服务端检查此项？后面再做考虑
				// if (!dataType.isAcceptUnknownProperty()) {
				// throw new IllegalArgumentException("Property [" +
				// property
				// + "] undefined in DataType [" + dataType.getName()
				// + "].");
				// }
			} else {
				if (propertyDef.getValidators() != null) {
					for (Validator validator : propertyDef.getValidators()) {
						validator.validate(newValue);
					}
				}

				// TODO: 暂时不在Server端维护OldValue
				// if (state != EntityState.NEW
				// && propertyDef instanceof BasePropertyDef) {
				// Map<String, Object> oldValues = getOldValues(true);
				// if (!oldValues.containsKey(property)) {
				// Object originValue = internalReadProperty(entity,
				// property, isExProp);
				// if (originValue == null
				// || EntityUtils.isSimpleValue(originValue)) {
				// oldValues.put(property, originValue);
				// }
				// }
				// }
			}

			setTimeStamp(newTimeStamp());
			if (state == EntityState.NONE) {
				setState(EntityState.MODIFIED);
			}
		}

		if (propertyDef != null && propertyDef instanceof BasePropertyDef) {
			BasePropertyDef basePropertyDef = (BasePropertyDef) propertyDef;
			String propertyPath = basePropertyDef.getPropertyPath();
			if (StringUtils.isNotEmpty(propertyPath)) {
				validatePropertyPath(basePropertyDef);
				PropertyPathUtils.setValueByPath(dataType, entity,
						propertyPath, newValue);
				return false;
			}
		}
		return true;
	}

	private Object readPropertyDef(Object entity, PropertyDef propertyDef,
			Object originResult) throws Throwable {
		Object result;
		if (propertyDef instanceof Reference) {
			result = readReference(entity, (Reference) propertyDef,
					originResult);
		} else {
			throw new IllegalArgumentException("Unknown PropertyDef type ["
					+ propertyDef + "].");
		}
		return result;
	}

	private Object readReference(Object entity, Reference referenceProperty,
			Object originResult) throws Throwable {
		if (!referenceProperty.shouldIntercept()
				|| isGetterInterceptionDisabled()) {
			setHasGetterResultSkiped();
			return originResult;
		} else {
			DataProvider dataProvider = referenceProperty.getDataProvider();

			JexlContext jexlContext = getExpressionHandler().getJexlContext();
			Object originThis = jexlContext.get(THIS);
			jexlContext.set(THIS, entity);
			try {
				DataType dataType = referenceProperty.getDataType();
				return dataProvider.getResult(referenceProperty.getParameter(),
						dataType);
			} finally {
				jexlContext.set(THIS, originThis);
			}
		}
	}

	public Class<?> getPropertyType(Object entity, String property) {
		if (entity instanceof BeanMap) {
			return ((BeanMap) entity).getPropertyType(property);
		} else if (!(entity instanceof Map<?, ?>)) {
			try {
				return PropertyUtils.getPropertyType(entity, property);
			} catch (Exception e) {
				logger.warn(e, e);
			}
		}
		return null;
	}

	public abstract Object readProperty(Object entity, String property,
			boolean ignoreInterceptors) throws Throwable;

	public abstract void writeProperty(Object entity, String property,
			Object value) throws Throwable;

}

class GetterInterceptionInjectorCounter {
	boolean disabled;
	boolean hasPropertyResultSkiped;
}

class GetterInterceptionInjector extends
		ThreadLocal<GetterInterceptionInjectorCounter> {

	private GetterInterceptionInjectorCounter getCounter() {
		GetterInterceptionInjectorCounter counter = get();
		if (counter == null) {
			counter = new GetterInterceptionInjectorCounter();
			set(counter);
		}
		return counter;
	}

	private void throwInvalidState() {
		throw new IllegalStateException("Invalid entity interception state.");
	}

	public void disableGetterInterception() {
		GetterInterceptionInjectorCounter counter = getCounter();
		if (counter.disabled) {
			throwInvalidState();
		}
		counter.disabled = true;
	}

	public void enableGetterInterception() {
		GetterInterceptionInjectorCounter counter = getCounter();
		if (!counter.disabled) {
			throwInvalidState();
		}
		counter.disabled = false;
	}

	public boolean isGetterInterceptionDisabled() {
		GetterInterceptionInjectorCounter counter = get();
		return (counter == null) ? false : counter.disabled;
	}

	public boolean hasPropertyResultSkiped() {
		return getCounter().hasPropertyResultSkiped;
	}

	public void setHasPropertyResultSkiped() {
		getCounter().hasPropertyResultSkiped = true;
	}

	public void resetHasPropertyResultSkiped() {
		getCounter().hasPropertyResultSkiped = false;
	}
}
