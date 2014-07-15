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
import java.util.Set;

import com.bstek.dorado.data.config.definition.DataTypeDefinitionManager;
import com.bstek.dorado.data.type.DataType;

/**
 * DataType的管理器。
 * <p>
 * 用于管理一组DataType的管理类。<br>
 * DataTypeManager内部使用
 * {@link com.bstek.dorado.data.config.definition.DataTypeDefinitionManager}
 * 来实现最基本的DataType的注册功能。
 * 同时，DataTypeManager在DataTypeDefinitionManager的基础上完成了更加丰富的功能。
 * 例如根据Java数据类型自动选择最为匹配的DataType。
 * </p>
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 9, 2008
 * @see com.bstek.dorado.data.type.DataType
 * @see com.bstek.dorado.data.type.manager.DefaultDataTypeManager
 */
public interface DataTypeManager {

	/**
	 * 返回DataType配置声明管理器。
	 */
	DataTypeDefinitionManager getDataTypeDefinitionManager();

	Set<String> getDataTypeNames();

	/**
	 * 根据DataType的名字返回相应的DataType。
	 * 
	 * @param name
	 *            DataType的名字
	 * @throws Exception
	 */
	DataType getDataType(String name) throws Exception;

	/**
	 * 根据注册信息来确定应该用哪种DataType来描述给定的Class类型。 即根据Java数据类型自动选择最为匹配的DataType。
	 * 
	 * @param type
	 *            给定的Class类型
	 * @throws Exception
	 */
	DataType getDataType(Type type) throws Exception;

	DataType createDataType(String name) throws Exception;

	DataType createDataType(String name, String parents) throws Exception;

	/**
	 * 清除用于提高getDataType(Type type)操作效率的缓存信息。
	 */
	void clearCache();

}
