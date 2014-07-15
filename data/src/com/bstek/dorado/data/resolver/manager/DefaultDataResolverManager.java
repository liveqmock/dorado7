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

import com.bstek.dorado.data.config.definition.DataCreationContext;
import com.bstek.dorado.data.config.definition.DataResolverDefinition;
import com.bstek.dorado.data.config.definition.DataResolverDefinitionManager;
import com.bstek.dorado.data.resolver.DataResolver;

/**
 * 默认的DataResolver管理类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 8 2007
 */
public class DefaultDataResolverManager implements DataResolverManager {
	private DataResolverDefinitionManager dataResolverDefinitionManager;

	/**
	 * 设置DataResolver配置声明管理器。
	 */
	public void setDataResolverDefinitionManager(
			DataResolverDefinitionManager dataResolverDefinitionManager) {
		this.dataResolverDefinitionManager = dataResolverDefinitionManager;
	}

	public DataResolverDefinitionManager getDataResolverDefinitionManager() {
		return dataResolverDefinitionManager;
	}

	public DataResolver getDataResolver(String name) throws Exception {
		DataResolverDefinition definition = dataResolverDefinitionManager
				.getDefinition(name);
		return (definition != null) ? (DataResolver) definition
				.create(new DataCreationContext()) : null;
	}

}
