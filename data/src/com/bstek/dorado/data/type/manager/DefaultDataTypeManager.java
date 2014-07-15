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

package com.bstek.dorado.data.type.manager;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.config.definition.Definition;
import com.bstek.dorado.data.config.definition.DataTypeDefinition;

/**
 * 默认的DataType管理器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 9, 2008
 */
public class DefaultDataTypeManager extends DataTypeManagerSupport {
	private static final Log logger = LogFactory
			.getLog(DefaultDataTypeManager.class);

	private static final String ARRAY = "Array";

	private class DataTypeWrapper {
		private DataTypeDefinition dataType;
		private Class<?> type;

		public DataTypeWrapper(DataTypeDefinition dataType, Class<?> type) {
			this.dataType = dataType;
			this.type = type;
		}

		public DataTypeDefinition getDataType() {
			return dataType;
		}

		public Class<?> getType() {
			return type;
		}

		@Override
		public boolean equals(Object obj) {
			if (obj instanceof DataTypeWrapper) {
				DataTypeWrapper dtw = (DataTypeWrapper) obj;
				return (type.equals(dtw.getType()) && dataType.equals(dtw
						.getDataType()));
			} else {
				return false;
			}
		}

		@Override
		public int hashCode() {
			return (dataType.hashCode() >> 4) + type.hashCode();
		}

	}

	/**
	 * 根据注册信息来确定应该用哪种DataType来描述给定的Class类型。<br>
	 * 此处只需要考虑那些不能直接通过DataTypeDefinitionManager完成匹配的情况。
	 * 
	 * @param type
	 *            给定的Class类型
	 * @throws Exception
	 */
	@Override
	protected DataTypeDefinition getDataTypeDefinition(Type type)
			throws Exception {
		DataTypeDefinition dataType = null;
		if (type instanceof Class<?> && ((Class<?>) type).isArray()) {
			Class<?> cl = (Class<?>) type;
			DataTypeDefinition componentDataType = getDataTypeDefinitionByType(cl
					.getComponentType());
			String name = ARRAY + '[' + componentDataType.getName() + ']';
			dataType = getDataTypeDefinitionManager().getDefinition(name);
		} else if (type instanceof ParameterizedType) {
			Class<?> elementType = null;
			Type[] actualTypeArguments = ((ParameterizedType) type)
					.getActualTypeArguments();
			if (actualTypeArguments.length > 0) {
				elementType = (Class<?>) actualTypeArguments[0];
			}
			if (elementType != null) {
				DataTypeDefinition elementDataType = getDataTypeDefinitionByType(elementType);
				if (elementDataType != null) {
					String name = '[' + elementDataType.getName() + ']';
					dataType = getDataTypeDefinitionManager().getDefinition(
							name);
				}
			}
		}
		if (dataType == null && type instanceof Class<?>) {
			dataType = getDataTypeDefinitionByType((Class<?>) type);
		}
		return dataType;
	}

	protected DataTypeDefinition getDataTypeDefinitionByType(Class<?> type) {
		DataTypeDefinition dataType = null;
		Set<DataTypeWrapper> dtws = findAllMatchingDataTypes(type);

		// 移除重复的或者相容类型中更加靠近继承树顶层的DataType
		filterMatchingDataTypes(dtws);

		// 最终确定匹配的DataType
		int size = dtws.size();
		if (size == 1) {
			DataTypeWrapper dtw = dtws.iterator().next();
			dataType = dtw.getDataType();
		} else if (size > 1) {
			logger.warn("More than one matching DataTypes found for ["
					+ type.getName() + "]!");
		}
		return dataType;
	}

	/**
	 * 返回所有与给定的接口匹配的DataType。
	 */
	private Set<DataTypeWrapper> findMatchingDataTypeForInterface(Class<?> type) {
		Set<DataTypeWrapper> dtws = new HashSet<DataTypeWrapper>();
		Class<?>[] interfaces = type.getInterfaces();
		for (Class<?> interfaceType : interfaces) {
			DataTypeDefinition dataType = getDefinedDataTypeDefinition(interfaceType);
			if (dataType != null) {
				dtws.add(new DataTypeWrapper(dataType, interfaceType));
			} else {
				dtws.addAll(findMatchingDataTypeForInterface(interfaceType));
			}
		}
		return dtws;
	}

	/**
	 * 返回所有与给定的Class类型匹配的DataType。
	 */
	private Set<DataTypeWrapper> findAllMatchingDataTypes(Class<?> type) {
		Set<DataTypeWrapper> dtws = new HashSet<DataTypeWrapper>();

		DataTypeDefinition dataType = getDefinedDataTypeDefinition(type);
		if (dataType != null) {
			dtws.add(new DataTypeWrapper(dataType, type));

		}

		// 查找接口的匹配类型
		dtws.addAll(findMatchingDataTypeForInterface(type));

		// 查找父类的匹配类型
		for (Class<?> tempType = type.getSuperclass(); tempType != null; tempType = tempType
				.getSuperclass()) {
			// 查找父类接口的匹配类型
			dtws.addAll(findMatchingDataTypeForInterface(tempType));

			if (type.isEnum() && tempType.equals(Object.class)) {
				tempType = String.class;
			}

			dataType = getDefinedDataTypeDefinition(tempType);
			if (dataType != null) {
				dtws.add(new DataTypeWrapper(dataType, tempType));
				break;
			}
		}
		return dtws;
	}

	/**
	 * 判断某数据类型是否是另一个数据类型的子类型。
	 */
	protected boolean isChildTypeOf(DataTypeDefinition dataType,
			DataTypeDefinition parentDataType) {
		Definition[] parents = dataType.getParents();
		if (parents != null) {
			for (Definition parent : parents) {
				if (parent == parentDataType) {
					return true;
				} else {
					boolean isChild = isChildTypeOf(
							(DataTypeDefinition) parent, parentDataType);
					if (isChild) {
						return true;
					}
				}
			}
		}
		return false;
	}

	/**
	 * 从所有可能的匹配的DataType中，移除那些重复的或者相容类型中更加靠近继承树顶层的DataType。
	 */
	private void filterMatchingDataTypes(Set<DataTypeWrapper> dtws) {
		DataTypeWrapper[] dtwArray = new DataTypeWrapper[dtws.size()];
		dtws.toArray(dtwArray);

		for (DataTypeWrapper dtw1 : dtwArray) {
			Iterator<DataTypeWrapper> iter = dtws.iterator();
			while (iter.hasNext()) {
				DataTypeWrapper dtw2 = iter.next();
				if (dtw1 != dtw2) {
					if (dtw1.getType().isAssignableFrom(dtw2.getType())) {
						dtws.remove(dtw1);
						break;
					}

					if (isChildTypeOf(dtw2.getDataType(), dtw1.getDataType())) {
						dtws.remove(dtw1);
						break;
					}
				}
			}
		}
	}

}
