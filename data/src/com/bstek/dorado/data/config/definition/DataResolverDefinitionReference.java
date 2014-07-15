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

package com.bstek.dorado.data.config.definition;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.config.definition.DefinitionReference;
import com.bstek.dorado.core.Context;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-2-3
 */
public class DataResolverDefinitionReference implements
		DefinitionReference<DataResolverDefinition> {
	private static Log logger = LogFactory
			.getLog(DataResolverDefinitionReference.class);

	private static DataResolverDefinitionManager dataResolverDefinitionManager;

	private String name;

	/**
	 * @param definitionManager
	 *            配置声明管理器
	 * @param name
	 *            指向的声明对象在注册时使用的名称
	 */
	public DataResolverDefinitionReference(String name) {
		this.name = name;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	private DataResolverDefinitionManager getDataResolverDefinitionManager() {
		if (dataResolverDefinitionManager == null) {
			try {
				Context current = Context.getCurrent();
				dataResolverDefinitionManager = (DataResolverDefinitionManager) current
						.getServiceBean("dataResolverDefinitionManager");
			} catch (Exception e) {
				logger.error(e, e);
			}
		}
		return dataResolverDefinitionManager;
	}

	public DataResolverDefinition getDefinition() {
		Context current = Context.getCurrent();
		DataResolverDefinitionManager dtfm = (DataResolverDefinitionManager) current
				.getAttribute(Context.THREAD,
						"privateDataResolverDefinitionManager");
		if (dtfm == null) {
			dtfm = getDataResolverDefinitionManager();
		}

		DataResolverDefinition definition = null;
		if (dtfm != null) {
			definition = dtfm.getDefinition(name);
		}
		if (definition == null) {
			throw new IllegalArgumentException("Unrecognized DataResolver \""
					+ name + "\".");
		}
		return definition;
	}
}
