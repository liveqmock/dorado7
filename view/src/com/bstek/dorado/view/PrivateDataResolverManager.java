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

package com.bstek.dorado.view;

import org.apache.commons.jexl2.JexlContext;

import com.bstek.dorado.config.definition.Definition;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.el.ExpressionHandler;
import com.bstek.dorado.data.resolver.DataResolver;
import com.bstek.dorado.data.resolver.manager.DataResolverManager;
import com.bstek.dorado.data.resolver.manager.DefaultDataResolverManager;
import com.bstek.dorado.view.config.PrivateDataProviderDefinitionManager;
import com.bstek.dorado.view.config.PrivateDataResolverDefinitionManager;
import com.bstek.dorado.view.config.PrivateDataTypeDefinitionManager;
import com.bstek.dorado.view.config.definition.ViewConfigDefinition;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-7-21
 */
public class PrivateDataResolverManager extends DefaultDataResolverManager {
	private DataResolverManager parent;
	private PrivateDataTypeDefinitionManager privateDataTypeDefinitionManager;
	private PrivateDataProviderDefinitionManager privateDataProviderDefinitionManager;
	private PrivateDataResolverDefinitionManager privateDataResolverDefinitionManager;

	public PrivateDataResolverManager(
			DataResolverManager parent,
			PrivateDataTypeDefinitionManager privateDataTypeDefinitionManager,
			PrivateDataProviderDefinitionManager privateDataProviderDefinitionManager,
			PrivateDataResolverDefinitionManager privateDataResolverDefinitionManager) {
		this.setDataResolverDefinitionManager(privateDataResolverDefinitionManager);
		this.privateDataTypeDefinitionManager = privateDataTypeDefinitionManager;
		this.privateDataResolverDefinitionManager = privateDataResolverDefinitionManager;
		this.privateDataResolverDefinitionManager = privateDataResolverDefinitionManager;
		this.parent = parent;
	}

	@Override
	public DataResolver getDataResolver(String name) throws Exception {
		ViewConfigDefinition viewConfigDefinition = privateDataResolverDefinitionManager
				.getViewConfigDefinition();

		Context context = Context.getCurrent();
		ExpressionHandler expressionHandler = (ExpressionHandler) context
				.getServiceBean("expressionHandler");
		JexlContext jexlContext = expressionHandler.getJexlContext();

		Object originArgumentsVar = jexlContext
				.get(ViewConfigDefinition.ARGUMENT);
		jexlContext.set(ViewConfigDefinition.ARGUMENT,
				viewConfigDefinition.getArguments());

		Definition resourceRelativeDefinition = (Definition) jexlContext
				.get(ViewConfigDefinition.RESOURCE_RELATIVE_DEFINITION);
		jexlContext.set(ViewConfigDefinition.RESOURCE_RELATIVE_DEFINITION,
				viewConfigDefinition);

		Object oldDtdm = context.getAttribute(Context.THREAD,
				"privateDataTypeDefinitionManager");
		Object oldDpdm = context.getAttribute(Context.THREAD,
				"privateDataProviderDefinitionManager");
		Object oldDrdm = context.getAttribute(Context.THREAD,
				"privateDataResolverDefinitionManager");

		context.setAttribute(Context.THREAD,
				"privateDataTypeDefinitionManager",
				privateDataTypeDefinitionManager);
		context.setAttribute(Context.THREAD,
				"privateDataProviderDefinitionManager",
				privateDataProviderDefinitionManager);
		context.setAttribute(Context.THREAD,
				"privateDataResolverDefinitionManager",
				privateDataResolverDefinitionManager);
		try {
			DataResolver dataResolver = super.getDataResolver(name);
			if (dataResolver == null && parent != null) {
				dataResolver = parent.getDataResolver(name);
			}
			return dataResolver;
		} finally {
			jexlContext.set(ViewConfigDefinition.ARGUMENT, originArgumentsVar);
			jexlContext.set(ViewConfigDefinition.RESOURCE_RELATIVE_DEFINITION,
					resourceRelativeDefinition);

			context.setAttribute(Context.THREAD,
					"privateDataTypeDefinitionManager", oldDtdm);
			context.setAttribute(Context.THREAD,
					"privateDataProviderDefinitionManager", oldDpdm);
			context.setAttribute(Context.THREAD,
					"privateDataResolverDefinitionManager", oldDrdm);
		}
	}
}
