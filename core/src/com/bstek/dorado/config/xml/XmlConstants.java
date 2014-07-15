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

package com.bstek.dorado.config.xml;

/**
 * 与XML配置文件解析过程相关的常量。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 13, 2007
 */
public abstract class XmlConstants {

	/**
	 * "id属性"的属性名。
	 */
	public static final String ATTRIBUTE_ID = "id";

	/**
	 * "名称属性"的属性名。
	 */
	public static final String ATTRIBUTE_NAME = "name";

	/**
	 * "值属性"的属性名。
	 */
	public static final String ATTRIBUTE_VALUE = "value";

	/**
	 * "作用范围(生命周期)"的属性名。
	 */
	public static final String ATTRIBUTE_SCOPE = "scope";

	/**
	 * "实现类"属性的属性名。
	 */
	public static final String ATTRIBUTE_IMPL = "impl";

	/**
	 * "拦截器"属性的属性名。
	 */
	public static final String ATTRIBUTE_INTERCEPTOR = "interceptor";

	/**
	 * "监听器"属性的属性名。
	 */
	public static final String ATTRIBUTE_LISTENER = "listener";

	/**
	 * "父对象"属性的属性名。
	 */
	public static final String ATTRIBUTE_PARENT = "parent";

	/**
	 * "属性集合节点"的节点名。
	 */
	public static final String PROPERTIES = "Properties";

	/**
	 * "属性节点"的节点名。
	 */
	public static final String PROPERTY = "Property";

	/**
	 * "值节点"的节点名。
	 */
	public static final String VALUE = "Value";

	/**
	 * "导入点"节点的节点名。
	 */
	public static final String IMPORT = "Import";

	/**
	 * "导入点"节点的节点名。
	 */
	public static final String PLACE_HOLDER = "PlaceHolder";

	/**
	 * "导入段开始点"节点的节点名。
	 */
	public static final String PLACE_HOLDER_START = "PlaceHolderStart";

	/**
	 * "导入点"节点的节点名。
	 */
	public static final String PLACE_HOLDER_END = "PlaceHolderEnd";

	/**
	 * "导出段开始点"节点的节点名。
	 */
	public static final String GROUP_START = "GroupStart";

	/**
	 * "导出点"节点的节点名。
	 */
	public static final String GROUP_END = "GroupEnd";

}
