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

import org.aopalliance.intercept.MethodInterceptor;

import com.bstek.dorado.config.definition.CreationContext;
import com.bstek.dorado.config.definition.Definition;
import com.bstek.dorado.config.definition.DefinitionReference;
import com.bstek.dorado.config.definition.DirectDefinitionReference;
import com.bstek.dorado.core.bean.BeanWrapper;
import com.bstek.dorado.data.config.xml.DataXmlConstants;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-12-13
 */
public class DirectDataProviderDefinition extends DataProviderDefinition {
	private Definition dataDefinition;

	public Definition getDataDefinition() {
		return dataDefinition;
	}

	public void setDataDefinition(Definition dataDefinition) {
		this.dataDefinition = dataDefinition;
	}

	@Override
	@SuppressWarnings("unchecked")
	protected BeanWrapper createObject(CreationInfo creationInfo,
			Object[] constructorArgs, MethodInterceptor[] methodInterceptors,
			CreationContext context) throws Exception {
		DataCreationContext createContext = (DataCreationContext) context;
		Object dataType = creationInfo.getProperties().get(
				DataXmlConstants.ATTRIBUTE_DATA_TYPE);
		if (dataType instanceof DataTypeDefinition) {
			dataType = new DirectDefinitionReference<DataTypeDefinition>(
					(DataTypeDefinition) dataType);
		}
		createContext
				.setCurrentDataTypeDefinition((DefinitionReference<DataTypeDefinition>) dataType);
		try {
			return super.createObject(creationInfo, constructorArgs,
					methodInterceptors, context);
		} finally {
			createContext.setCurrentDataTypeDefinition(null);
		}
	}

}
