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

package com.bstek.dorado.data.config;

import com.bstek.dorado.core.io.Resource;

/**
 * 数据配置文件的管理器的接口。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 20, 2007
 */
public interface DataConfigManager {

	/**
	 * 初始化方法。
	 * 
	 * @throws Exception
	 */
	void initialize() throws Exception;

	/**
	 * 装载一组数据配置文件中配置信息。
	 * <p>
	 * 注意：使用此方法时ConfigManager总是会首先清除所有的配置信息，然后再执行配置文件的装载。
	 * 即loadConfigs方法相当于重新装载所有的配置。
	 * </p>
	 * 
	 * @param resources
	 *            用于表示一组配置文件的资源描述数组
	 * @throws Exception
	 */
	void loadConfigs(Resource[] resources, boolean throwOnError) throws Exception;

	/**
	 * 从已装载的信息中卸载与传入的配置文件相关的那部分配置信息。
	 * 
	 * @param resources
	 *            用于表示一组配置文件的资源描述数组
	 * @throws Exception
	 */
	void unloadConfigs(Resource[] resources) throws Exception;

	/**
	 * 向管理器中添加一个监听器。
	 */
	void addConfigManagerListener(DataConfigManagerListener l);

	/**
	 * 从管理器中移除一个监听器。
	 */
	void removeConfigManagerListener(DataConfigManagerListener l);

}
