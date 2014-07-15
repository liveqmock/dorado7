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

package com.bstek.dorado.data.resolver.manager;

import com.bstek.dorado.data.config.definition.DataResolverDefinitionManager;
import com.bstek.dorado.data.resolver.DataResolver;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apr 29, 2009
 * @see com.bstek.dorado.annotation.com.bstek.dorado.data.annotation.DataResolver
 * @see com.bstek.dorado.data.config.definition.DataResolverDefinitionManager
 */
public interface DataResolverManager {

	/**
	 * 返回DataResolver配置声明管理器。
	 */
	DataResolverDefinitionManager getDataResolverDefinitionManager();

	/**
	 * 根据名称返回一个DataResolver。
	 * 
	 * @param name
	 *            DataResolver的名称。
	 * @throws Exception
	 */
	DataResolver getDataResolver(String name) throws Exception;
}
