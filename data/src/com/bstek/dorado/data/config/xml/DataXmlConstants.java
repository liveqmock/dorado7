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

package com.bstek.dorado.data.config.xml;

/**
 * 与数据模型XML配置文件解析过程相关的常量。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 13, 2007
 */
public abstract class DataXmlConstants {
	public static final String PATH_DATE_TYPE_SHORT_NAME = "t";
	public static final String PATH_DATE_PROVIDER_SHORT_NAME = "p";
	public static final String PATH_DATE_RESOLVER_SHORT_NAME = "r";
	public static final String PATH_PROPERTY_PREFIX = "#";
	public static final String PATH_SUB_OBJECT_PREFIX = "@";

	public static final String ENTITY = "Entity";
	public static final String DATA_TYPE = "DataType";
	public static final String RESULT_TYPE = "ResultDataType";
	public static final String PROPERTY_DEF = "PropertyDef";
	public static final String DATA_PROVIDER = "DataProvider";
	public static final String DATA_RESOLVER = "DataResolver";
	public static final String PARAMETER = "Parameter";
	public static final String RESULT = "Result";
	public static final String REFERENCE = "Reference";
	public static final String VALUE_DATA_TYPE = "ValueDataType";
	public static final String KEY_DATA_TYPE = "KeyDataType";
	public static final String ELEMENT_DATA_TYPE = "ElementDataType";

	public static final String ATTRIBUTE_DATA_TYPE = "dataType";
	public static final String ATTRIBUTE_DATA_PROVIDER = "dataProvider";
	public static final String ATTRIBUTE_DATA_RESOLVER = "dataResolver";
	public static final String ATTRIBUTE_OVERWRITE = "overwrite";
	public static final String ATTRIBUTE_PROPERTY = "property";
	public static final String ATTRIBUTE_METHOD = "method";
	public static final String ATTRIBUTE_MATCH_TYPE = "matchType";
	public static final String ATTRIBUTE_CREATION_TYPE = "creationType";
	public static final String ATTRIBUTE_RESULT_DATA_TYPE = "resultDataType";
	public static final String ATTRIBUTE_RESULT = "result";
	public static final String ATTRIBUTE_VALUE_DATA_TYPE = "valueDataType";
	public static final String ATTRIBUTE_KEY_DATA_TYPE = "keyDataType";
	public static final String ATTRIBUTE_ELEMENT_DATA_TYPE = "elementDataType";
	public static final String ATTRIBUTE_PROVIDER_TYPE = "type";
	public static final String ATTRIBUTE_RESOLVER_TYPE = "type";
	public static final String ATTRIBUTE_VALIDATOR_TYPE = "type";
	public static final String ATTRIBUTE_PARAMETER = "parameter";
	public static final String ATTRIBUTE_LISTENER = "listener";

}
