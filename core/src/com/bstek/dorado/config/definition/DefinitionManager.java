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

package com.bstek.dorado.config.definition;

import java.util.Map;

/**
 * 配置声明管理器。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 7, 2008
 */
public interface DefinitionManager<T extends Definition> {

	/**
	 * 注册一个配置声明对象。
	 * @param name 要注册的对象的名称
	 * @param definition 要注册的配置声明对象
	 */
	void registerDefinition(String name, T definition);

	/**
	 * 撤销对一个配置声明对象的注册。
	 * @param name 要注册的对象的名称
	 * @return 原先以此名称注册在管理器的配置声明对象
	 */
	T unregisterDefinition(String name);

	/**
	 * 根据名称获得一个已注册的配置声明对象。
	 * @param name 名称
	 * @return 配置声明对象
	 */
	T getDefinition(String name);

	/**
	 * 返回所有已注册的配置声明对象的Map集合。 <br>
	 * 该Map集合中的键为名称，值为配置声明对象。
	 */
	Map<String, T> getDefinitions();

	/**
	 * 清除所有已注册的配置声明对象，即撤销所有配置声明对象的注册。
	 */
	void clearAllDefinitions();
}
