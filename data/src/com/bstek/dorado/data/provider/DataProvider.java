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

package com.bstek.dorado.data.provider;

import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.core.bean.Scope;
import com.bstek.dorado.data.DataModelObject;
import com.bstek.dorado.data.type.DataType;

/**
 * 数据提供者的通用接口。
 * <p>
 * DataProvider最主要的功能就是为外界提供数据。 DataProvider可以根据其自身的定义和参数自动的完成数据的提取和组装。
 * </p>
 * <p>
 * DataProvider可以为返回的数据定义数据类型({@link com.bstek.dorado.data.type.DataType})。
 * 如果返回的实际数据与定义的数据类型不一致，那么DataProvider还会尽可能的将这些数据转换为需要的类型。 如果转换失败将抛出
 * {@link com.bstek.dorado.data.type.DataConvertException}异常。
 * </p>
 * <p>
 * 需要注意的是DataProvider应该通过
 * {@link com.bstek.dorado.data.provider.manager.DataProviderManager}
 * 来获得，直接new得到的DataProvider可能不能良好的工作。
 * </p>
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 8, 2007
 */
@XmlNode(
		nodeName = "DataProvider",
		parser = "spring:dorado.prototype.dataProviderParser",
		definitionType = "com.bstek.dorado.data.config.definition.DataProviderDefinition",
		scopable = true, inheritable = true, properties = {
				@XmlProperty(propertyName = "overwrite",
						propertyType = "boolean", attributeOnly = true, ignored = true),
				@XmlProperty(propertyName = "interceptor",
						parser = "spring:dorado.staticPropertyParser") })
public interface DataProvider extends DataModelObject {

	/**
	 * 返回DataProvider的名称。
	 */
	String getName();

	/**
	 * 返回作用范围。
	 */
	Scope getScope();

	/**
	 * 返回结果的数据类型。
	 */
	DataType getResultDataType();

	/**
	 * 设置结果的数据类型。
	 */
	void setResultDataType(DataType resultDataType);

	/**
	 * 设置默认参数。
	 */
	Object getParameter();

	/**
	 * 设置默认参数。
	 */
	void setParameter(Object parameter);

	/**
	 * 使用默认参数调用DataProvider，并获得返回给外界的数据。
	 * 
	 * @throws Exception
	 */
	Object getResult() throws Exception;

	/**
	 * 获得返回给外界的数据。
	 * 
	 * @param parameter
	 *            参数
	 * @return 要返回给外界的数据
	 * @throws Exception
	 */
	Object getResult(Object parameter) throws Exception;

	/**
	 * 获得返回给外界的数据。
	 * 
	 * @param parameter
	 *            参数
	 * @param resultDataType
	 *            结果的数据类型。
	 * @return 要返回给外界的数据
	 * @throws Exception
	 */
	Object getResult(Object parameter, DataType resultDataType)
			throws Exception;

	/**
	 * 使用默认参数调用DataProvider，并获得返回给外界的数据。
	 * 
	 * @param page
	 *            用于封装分页结果的对象。
	 * @throws Exception
	 * @see com.bstek.dorado.data.provider.Page
	 */
	void getPagingResult(Page<?> page) throws Exception;

	/**
	 * 获得返回给外界的数据。
	 * 
	 * @param parameter
	 *            参数
	 * @param page
	 *            用于封装分页结果的对象。
	 * @throws Exception
	 * @see com.bstek.dorado.data.provider.Page
	 */
	void getPagingResult(Object parameter, Page<?> page) throws Exception;

	/**
	 * 获得返回给外界的数据。
	 * 
	 * @param parameter
	 *            参数
	 * @param page
	 *            用于封装分页结果的对象。
	 * @param resultDataType
	 *            结果的数据类型。
	 * @throws Exception
	 * @see com.bstek.dorado.data.provider.Page
	 */
	void getPagingResult(Object parameter, Page<?> page, DataType resultDataType)
			throws Exception;

}
