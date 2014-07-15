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

import java.beans.PropertyDescriptor;
import java.lang.reflect.Method;
import java.util.Collections;
import java.util.HashSet;
import java.util.Hashtable;
import java.util.Map;
import java.util.Set;

import net.sf.cglib.beans.BeanMap;

import org.apache.commons.beanutils.PropertyUtils;

import com.bstek.dorado.data.type.EntityDataType;

public abstract class BeanEntityEnhancer extends EntityEnhancer {
	private static Set<Class<?>> cachedTypes = Collections
			.synchronizedSet(new HashSet<Class<?>>());
	private static Map<Class<?>, Map<String, Boolean>> propertiesCache = new Hashtable<Class<?>, Map<String, Boolean>>();
	private static Map<Class<?>, Map<Method, String>> readMethodsCache = new Hashtable<Class<?>, Map<Method, String>>();
	private static Map<Class<?>, Map<Method, String>> writeMethodsCache = new Hashtable<Class<?>, Map<Method, String>>();

	private Class<?> beanType;
	private Object entity;
	private BeanMap beanMap;
	protected Map<String, Boolean> properties;
	protected Map<Method, String> readMethods;
	protected Map<Method, String> writeMethods;

	public BeanEntityEnhancer(EntityDataType dataType, Class<?> beanType)
			throws Exception {
		super(dataType);
		this.beanType = beanType;
		buildReflectionCahce();
	}

	public Class<?> getBeanType() {
		return beanType;
	}

	protected synchronized void buildReflectionCahce() throws Exception {
		synchronized (cachedTypes) {
			if (!cachedTypes.contains(beanType)) {
				cachedTypes.add(beanType);

				Map<String, Boolean> properties = new Hashtable<String, Boolean>();
				Map<Method, String> readMethods = new Hashtable<Method, String>();
				Map<Method, String> writeMethods = new Hashtable<Method, String>();
				PropertyDescriptor[] propertyDescriptors = PropertyUtils
						.getPropertyDescriptors(beanType);
				for (PropertyDescriptor propertyDescriptor : propertyDescriptors) {
					String property = propertyDescriptor.getName();
					if (propertyDescriptor.getReadMethod() == null) {
						continue;
					}

					properties.put(property, Boolean.valueOf(propertyDescriptor
							.getWriteMethod() != null));

					Method readMethod = propertyDescriptor.getReadMethod();
					Method writeMethod = propertyDescriptor.getWriteMethod();
					if (readMethod != null) {
						if (readMethod.getDeclaringClass() != beanType) {
							readMethod = beanType.getMethod(
									readMethod.getName(),
									readMethod.getParameterTypes());
						}
						readMethods.put(readMethod, property);
					}
					if (writeMethod != null) {
						if (writeMethod.getDeclaringClass() != beanType) {
							writeMethod = beanType.getMethod(
									writeMethod.getName(),
									writeMethod.getParameterTypes());
						}
						writeMethods.put(writeMethod, property);
					}
				}
				propertiesCache.put(beanType, properties);
				readMethodsCache.put(beanType, readMethods);
				writeMethodsCache.put(beanType, writeMethods);
				this.properties = properties;
				this.readMethods = readMethods;
				this.writeMethods = writeMethods;
			} else {
				this.properties = propertiesCache.get(beanType);
				this.readMethods = readMethodsCache.get(beanType);
				this.writeMethods = writeMethodsCache.get(beanType);
			}
		}
	}

	@Override
	protected Set<String> doGetPropertySet(Object entity,
			boolean excludeExProperties) {
		Map<String, Object> exProperties = getExProperties(false);
		if (excludeExProperties || exProperties == null
				|| exProperties.isEmpty()) {
			return properties.keySet();
		} else {
			Set<String> propertySet = new HashSet<String>(properties.keySet());
			propertySet.addAll(exProperties.keySet());
			return propertySet;
		}
	}

	protected BeanMap getBeanMap(Object entity) {
		if (entity == this.entity && beanMap != null) {
			return beanMap;
		}

		this.entity = entity;
		beanMap = BeanMap.create(entity);
		return beanMap;
	}

	@Override
	protected Object internalReadProperty(Object entity, String property)
			throws Exception {
		return getBeanMap(entity).get(property);
	}

	@Override
	protected void internalWriteProperty(Object entity, String property,
			Object value) throws Exception {
		BeanMap beanMap = getBeanMap(entity);
		Class<?> propertyType = beanMap.getPropertyType(property);
		if (!propertyType.isInstance(value)) {
			value = tryConvertValue(propertyType, value);
		}
		PropertyUtils.setSimpleProperty(entity, property, value);
	}

	protected Object tryConvertValue(Class<?> propertyType, Object value) {
		if (java.util.Date.class.isAssignableFrom(propertyType)
				&& value instanceof java.util.Date) {
			long time = ((java.util.Date) value).getTime();
			if (java.sql.Date.class.isAssignableFrom(propertyType)) {
				value = new java.sql.Date(time);
			} else if (java.sql.Time.class.isAssignableFrom(propertyType)) {
				value = new java.sql.Time(time);
			} else if (java.sql.Timestamp.class.isAssignableFrom(propertyType)) {
				value = new java.sql.Timestamp(time);
			}
		}
		return value;
	}

	@Override
	public Object readProperty(Object entity, String property,
			boolean ignoreInterceptors) throws Throwable {
		boolean isExProp = !properties.containsKey(property);
		Object result = internalReadProperty(entity, property, isExProp);
		if (ignoreInterceptors) {
			return result;
		} else {
			return interceptReadMethod(entity, property, result, isExProp);
		}
	}

	@Override
	public void writeProperty(Object entity, String property, Object value)
			throws Throwable {
		Boolean writable = properties.get(property);
		boolean isExProp = !(writable != null && writable.booleanValue());
		if (interceptWriteMethod(entity, property, value, isExProp)) {
			internalWriteProperty(entity, property, value, isExProp);
		}
	}

}
