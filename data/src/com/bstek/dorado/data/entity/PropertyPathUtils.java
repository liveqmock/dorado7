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
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.BeanUtils;

import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.data.type.EntityDataType;
import com.bstek.dorado.data.type.property.PropertyDef;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-1-3
 */
public abstract class PropertyPathUtils {
	public static Object getValueByPath(EntityDataType dataType, Object object,
			String propertyPath) throws Exception {
		String[] paths = StringUtils.split(propertyPath, '.');
		Object value = object;
		for (int i = 0; i < paths.length; i++) {
			String path = paths[i];
			if (EntityUtils.isEntity(value)) {
				value = EntityUtils.getValue(value, path);
			} else if (value instanceof Map<?, ?>) {
				value = ((Map<?, ?>) value).get(path);
			} else {
				value = PropertyUtils.getSimpleProperty(value, path);
			}

			if (value == null) {
				break;
			}
		}
		return value;
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public static void setValueByPath(EntityDataType dataType, Object object,
			String propertyPath, Object value) throws Exception {
		String[] paths = StringUtils.split(propertyPath, '.');
		Object currentEntity = object;
		EntityDataType currentDataType = dataType;
		for (int i = 0; i < paths.length - 1; i++) {
			String path = paths[i];
			Object tempEntity;
			boolean isMap = currentEntity instanceof Map;
			if (EntityUtils.isEntity(currentEntity)) {
				tempEntity = EntityUtils.getValue(currentEntity, path);
			} else if (currentEntity instanceof Map) {
				tempEntity = ((Map) currentEntity).get(path);
			} else {
				tempEntity = PropertyUtils.getSimpleProperty(currentEntity,
						path);
			}

			if (tempEntity == null) {
				Class<?> subEntityType = null;
				if (currentDataType != null) {
					PropertyDef propertyDef = currentDataType
							.getPropertyDef(path);
					if (propertyDef != null) {
						DataType propertyDataType = propertyDef.getDataType();
						if (propertyDataType instanceof EntityDataType) {
							currentDataType = (EntityDataType) propertyDataType;
							subEntityType = currentDataType.getCreationType();
							if (subEntityType == null) {
								subEntityType = currentDataType.getMatchType();
							}
						}
					}
				} else if (isMap) {
					tempEntity = new HashMap();
					currentDataType = null;
				}

				if (tempEntity == null) {
					if (subEntityType == null) {
						subEntityType = PropertyUtils.getPropertyType(
								currentEntity, path);
					}
					if (subEntityType.isAssignableFrom(Map.class)) {
						tempEntity = new HashMap();
					} else if (!subEntityType.isInterface()) {
						tempEntity = subEntityType.newInstance();
					}
					currentDataType = null;
				}

				if (tempEntity != null) {
					if (isMap) {
						((Map) currentEntity).put(path, tempEntity);
					} else {
						PropertyUtils.setSimpleProperty(currentEntity, path,
								tempEntity);
					}
				} else {
					throw new IllegalArgumentException(
							"Can not write value to ["
									+ StringUtils.join(paths, '.') + "] on ["
									+ ObjectUtils.identityToString(object)
									+ "].");
				}
			}
			currentEntity = tempEntity;
		}

		String path = paths[paths.length - 1];
		if (EntityUtils.isEntity(currentEntity)) {
			EntityUtils.setValue(currentEntity, path, value);
		} else if (currentEntity instanceof Map) {
			((Map) currentEntity).put(path, value);
		} else {
			PropertyUtils.setSimpleProperty(currentEntity, path, value);
		}
	}

	public static DataType getPropertyDataTypeByPath(EntityDataType dataType,
			String propertyPath) throws Exception {
		String[] paths = StringUtils.split(propertyPath, '.');
		DataType currentDataType = dataType;
		for (int i = 0; i < paths.length; i++) {
			String path = paths[i];
			if (currentDataType instanceof EntityDataType) {
				PropertyDef propertyDef = ((EntityDataType) currentDataType)
						.getPropertyDef(path);
				if (propertyDef != null) {
					currentDataType = propertyDef.getDataType();
					if (currentDataType == null) {
						break;
					}
				} else {
					currentDataType = null;
					break;
				}
			} else {
				currentDataType = null;
				break;
			}
		}
		return currentDataType;
	}

	public static Class<?> getPropertyTypeByPath(Class<?> beanType,
			String propertyPath) throws Exception {
		String[] paths = StringUtils.split(propertyPath, '.');
		Class<?> type = beanType;
		for (int i = 0; i < paths.length; i++) {
			String path = paths[i];
			PropertyDescriptor propertyDescriptor = BeanUtils
					.getPropertyDescriptor(type, path);
			if (propertyDescriptor != null) {
				type = propertyDescriptor.getPropertyType();
			} else {
				type = null;
				break;
			}
		}
		return type;
	}
}
