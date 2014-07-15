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

import java.lang.reflect.Type;
import java.util.Collection;
import java.util.Hashtable;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.core.Configure;
import com.bstek.dorado.data.config.definition.DataCreationContext;
import com.bstek.dorado.data.config.definition.DataTypeDefinition;
import com.bstek.dorado.data.config.definition.DataTypeDefinitionManager;
import com.bstek.dorado.data.type.DataType;

/**
 * DataType的管理器的抽象支持类。
 * <p>
 * 此外，为了提高自动匹配的效率，DataTypeManagerSupport会在每次通过运算为一个Java数据类型匹配DataType之后，
 * 将这个匹配关系保存到用于缓存的Map当中。以后，当系统再次发出相同Java数据类型的匹配请求时，
 * DataTypeManagerSupport将直接从缓存中提取匹配结果。
 * </p>
 * <p>
 * 上面提到的通过运算完成的匹配操作是指并非直接通过DataTypeDefinitionManager提取到的匹配结果。
 * 例如：我们在DataTypeDefinitionManager中注册了java.util.Map的相应DataType是MapDataType，
 * 那么在为java.util.HashMap进行匹配时，系统必须通过一些运算才能同样映射到MapDataType上。
 * </p>
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 9, 2008
 */
public abstract class DataTypeManagerSupport implements DataTypeManager {

	private DataTypeDefinitionManager dataTypeDefinitionManager;

	/**
	 * 用于缓存的以DataType的相关Java类型作为键值的DataType集合。
	 * 每当一个DataTypeRegistry利用自动匹配逻辑为一个Class类型确定相应的DataType之后，
	 * DataTypeRegistry就会将这一匹配结果保存到cachedTypesMap中以提到后续相同操作的执行效率。
	 */
	private Map<Type, DataTypeDefinition> cachedTypesMap = new Hashtable<Type, DataTypeDefinition>();

	/**
	 * 设置DataType配置声明管理器。
	 */
	public void setDataTypeDefinitionManager(
			DataTypeDefinitionManager dataTypeDefinitionManager) {
		this.dataTypeDefinitionManager = dataTypeDefinitionManager;
	}

	public DataTypeDefinitionManager getDataTypeDefinitionManager() {
		return dataTypeDefinitionManager;
	}

	/**
	 * 根据得到的DataType配置声明对象返回一个真正的DataType对象。
	 * 
	 * @param dataTypeDefinition
	 *            DataType的配置声明对象
	 * @return DataType对象
	 */
	protected DataType getDataTypeByDefinition(
			DataTypeDefinition dataTypeDefinition) throws Exception {
		return (DataType) dataTypeDefinition.create(new DataCreationContext());
	}

	/**
	 * 根据DataType的名称返回一个DataType的配置声明对象。
	 * 
	 * @param name
	 *            DataType的名称
	 * @return DataType的配置声明对象
	 */
	protected DataTypeDefinition getDefinedDataTypeDefinition(String name) {
		return dataTypeDefinitionManager.getDefinition(name);
	}

	/**
	 * 根据一个给定的Java数据类型返回一个匹配的DataType的配置声明对象。<br>
	 * 注意，此方法只根据给定的Java数据类型到DataTypeDefinitionManager进行简单的对象提取。
	 * 
	 * @param type
	 *            Java数据类型
	 * @return DataType的配置声明对象
	 */
	protected DataTypeDefinition getDefinedDataTypeDefinition(Type type) {
		return dataTypeDefinitionManager.getDefinition(type);
	}

	public DataType getDataType(String name) throws Exception {
		DataType dataType = null;
		DataTypeDefinition dataTypeDefinition = getDefinedDataTypeDefinition(name);
		if (dataTypeDefinition != null) {
			dataType = getDataTypeByDefinition(dataTypeDefinition);
		}
		return dataType;
	}

	public DataType getDataType(Type type) throws Exception {
		DataTypeDefinition dataTypeDefinition = null;
		if (type instanceof Class<?>) {
			Class<?> cl = (Class<?>) type;
			if (!cl.isArray() && !Collection.class.isAssignableFrom(cl)) {
				dataTypeDefinition = getDefinedDataTypeDefinition(type);
			}
		}
		if (dataTypeDefinition == null) {
			dataTypeDefinition = cachedTypesMap.get(type);
			if (dataTypeDefinition == null) {
				dataTypeDefinition = getDataTypeDefinition(type);
				if (dataTypeDefinition != null) {
					cachedTypesMap.put(type, dataTypeDefinition);
				}
			}
		}

		if (dataTypeDefinition == null) {
			throw new IllegalStateException(
					"Can not found matching DataType for \"" + type + "\"!");
		}
		return getDataTypeByDefinition(dataTypeDefinition);
	}

	public Set<String> getDataTypeNames() {
		return dataTypeDefinitionManager.getDefinitions().keySet();
	}

	public DataType createDataType(String name) throws Exception {
		final String DEFAULT_DATATYPE_PARENT = Configure.getString(
				"data.defaultEntityDataTypeParent", "Entity");
		return doCreateDataType(name, DEFAULT_DATATYPE_PARENT);
	}

	public DataType createDataType(String name, String parents)
			throws Exception {
		return doCreateDataType(name, parents);
	}

	protected DataType doCreateDataType(String name, String parents)
			throws Exception {
		if (getDataType(name) != null) {
			throw new IllegalArgumentException("DataType [" + name
					+ "] already exists.");
		}

		if (StringUtils.isEmpty(parents)) {
			throw new IllegalArgumentException(
					"Argument \"parents\" undefined.");
		}

		String[] parentNames = StringUtils.split(parents, ",");
		DataTypeDefinition[] parentDefinitions = new DataTypeDefinition[parentNames.length];
		int i = 0;
		for (String parent : parentNames) {
			DataTypeDefinition parentDefinition = dataTypeDefinitionManager
					.getDefinition(parent);
			parentDefinitions[i++] = parentDefinition;
		}

		DataTypeDefinition dataTypeDefinition = new DataTypeDefinition();
		dataTypeDefinition.setName(name);
		dataTypeDefinition.setParents(parentDefinitions);
		dataTypeDefinitionManager.registerDefinition(name, dataTypeDefinition);

		return getDataType(name);
	}

	/**
	 * 内部的用于完成根据Java数据类型自动选择最为匹配的DataType功能的抽象方法。
	 * <p>
	 * 注意：实现此方法时不必实现可直接利用type在DataTypeDefinitionManager中找到相应DataType的情况，
	 * 此功能已由DataTypeManagerSupport实现。
	 * 因此在此方法只需要考虑那些不能直接通过DataTypeDefinitionManager完成匹配的情况。
	 * </p>
	 * 
	 * @param type
	 *            给定的Class类型
	 * @return 匹配的DataType
	 * @throws Exception
	 */
	protected abstract DataTypeDefinition getDataTypeDefinition(Type type)
			throws Exception;

	public void clearCache() {
		cachedTypesMap.clear();
	}
}
