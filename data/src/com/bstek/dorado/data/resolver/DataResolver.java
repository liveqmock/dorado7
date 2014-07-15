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

package com.bstek.dorado.data.resolver;

import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.core.bean.Scope;
import com.bstek.dorado.data.DataModelObject;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apr 29, 2009
 */
@XmlNode(
		nodeName = "DataResolver",
		parser = "spring:dorado.prototype.dataResolverParser",
		definitionType = "com.bstek.dorado.data.config.definition.DataResolverDefinition",
		scopable = true, inheritable = true, properties = {
				@XmlProperty(propertyName = "overwrite",
						propertyType = "boolean", attributeOnly = true,
						ignored = true),
				@XmlProperty(propertyName = "interceptor",
						parser = "spring:dorado.staticPropertyParser") })
public interface DataResolver extends DataModelObject {
	/**
	 * 返回DataResolver的名称。
	 */
	String getName();

	/**
	 * 返回作用范围。
	 */
	Scope getScope();

	/**
	 * 设置默认参数。
	 */
	Object getParameter();

	/**
	 * 设置默认参数。
	 */
	void setParameter(Object parameter);

	/**
	 * @param dataItems
	 * @param parameter
	 * @return
	 * @throws Exception
	 */
	Object resolve(DataItems dataItems) throws Exception;

	/**
	 * @param dataItems
	 * @param parameter
	 * @return
	 * @throws Exception
	 */
	Object resolve(DataItems dataItems, Object parameter) throws Exception;
}
