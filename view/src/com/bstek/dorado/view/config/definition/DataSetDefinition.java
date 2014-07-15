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

package com.bstek.dorado.view.config.definition;


import com.bstek.dorado.config.definition.CreationContext;
import com.bstek.dorado.config.definition.DefinitionUtils;
import com.bstek.dorado.data.provider.DataProvider;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.view.registry.ComponentTypeRegisterInfo;
import com.bstek.dorado.view.widget.data.DataSet;

/**
 * 数据集的配置声明对象。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 31, 2008
 */
public class DataSetDefinition extends ComponentDefinition {
	private Object dataProvider;
	private Object dataType;

	public DataSetDefinition(ComponentTypeRegisterInfo registerInfo) {
		super(registerInfo);
	}

	public Object getDataProvider() {
		return dataProvider;
	}

	public void setDataProvider(Object dataProvider) {
		this.dataProvider = dataProvider;
	}

	public Object getDataType() {
		return dataType;
	}

	public void setDataType(Object dataType) {
		this.dataType = dataType;
	}

	@Override
	protected void doInitObject(Object object, CreationInfo creationInfo,
			CreationContext context) throws Exception {
		super.doInitObject(object, creationInfo, context);

		DataSet dataSet = (DataSet) object;
		dataSet.setDataType((DataType) DefinitionUtils.getRealValue(dataType,
				context));

		dataSet.setDataProvider((DataProvider) DefinitionUtils.getRealValue(
				dataProvider, context));
		if (dataSet.getDataType() == null && dataSet.getDataProvider() != null) {
			dataSet.setDataType(dataSet.getDataProvider().getResultDataType());
		}
	}

}
