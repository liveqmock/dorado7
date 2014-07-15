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

package com.bstek.dorado.data.type.property;

import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.core.el.Expression;
import com.bstek.dorado.data.provider.DataProvider;

/**
 * 数据关联属性。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apirl 21, 2007
 */
@XmlNode(
		parser = "spring:dorado.referenceParser",
		definitionType = "com.bstek.dorado.data.config.definition.PropertyDefDefinition")
@ClientObject(prototype = "dorado.Reference", shortTypeName = "Reference")
@ClientEvents({
		@com.bstek.dorado.annotation.ClientEvent(name = "beforeLoadData"),
		@com.bstek.dorado.annotation.ClientEvent(name = "onLoadData") })
public class Reference extends LazyPropertyDef {
	private boolean activeOnNewEntity;
	private DataProvider dataProvider;
	private int pageSize;
	private Object parameter;

	public Reference() {
	}

	public Reference(String name) {
		setName(name);
	}

	public boolean isActiveOnNewEntity() {
		return activeOnNewEntity;
	}

	public void setActiveOnNewEntity(boolean activeOnNewEntity) {
		this.activeOnNewEntity = activeOnNewEntity;
	}

	/**
	 * 设置该属性内部使用的数据提供器(DataProvider)。
	 */
	public void setDataProvider(DataProvider dataProvider) {
		this.dataProvider = dataProvider;
	}

	/**
	 * 返回该属性内部使用的数据提供器(DataProvider)。
	 */
	@XmlProperty(ignored = true)
	@ClientProperty(outputter = "spring:dorado.dataProviderPropertyOutputter")
	@IdeProperty(highlight = 1)
	public DataProvider getDataProvider() {
		return dataProvider;
	}

	public int getPageSize() {
		return pageSize;
	}

	public void setPageSize(int pageSize) {
		this.pageSize = pageSize;
	}

	/**
	 * 返回将要传递给DataProvider的参数。
	 */
	@XmlProperty
	@ClientProperty(outputter = "spring:dorado.doradoMapPropertyOutputter",
			evaluateExpression = false)
	@IdeProperty(editor = "pojo", highlight = 1)
	public Object getParameter() {
		if (parameter instanceof Expression) {
			return ((Expression) parameter).evaluate();
		} else {
			return parameter;
		}
	}

	/**
	 * 设置将要传递给DataProvider的参数。
	 * <p>
	 * 默认情况下，如果没有特别指定此参数，
	 * 系统将会将当前的实体数据(即此属性所属的EntityDataType型的数据)作为DataProvider的参数。
	 * </p>
	 */
	public void setParameter(Object parameter) {
		this.parameter = parameter;
	}

	/**
	 * 返回是否启用针对数据实体中相应属性的read方法的拦截器。<br>
	 * 如果此方法返回false，那么数据参照属性事实上将处于无效的状态。
	 */
	public boolean shouldIntercept() {
		return true;
	}
}
