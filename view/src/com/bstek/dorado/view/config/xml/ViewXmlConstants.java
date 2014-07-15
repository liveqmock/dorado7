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

package com.bstek.dorado.view.config.xml;

/**
 * 与视图XML配置文件解析过程相关的常量。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 13, 2007
 */
public abstract class ViewXmlConstants {

	public static final String PATH_VIEW_SHORT_NAME = "v";
	public static final String PATH_COMPONENT_PREFIX = "$";

	/**
	 * Model节点的节点名。
	 */
	public static final String MODEL = "Model";

	/**
	 * View节点的节点名。
	 */
	public static final String VIEW_CONFIG = "ViewConfig";

	public static final String ATTRIBUTE_TEMPALTE = "template";

	public static final String ATTRIBUTE_PAGE_TEMPALTE = "pageTemplate";

	public static final String ATTRIBUTE_PACKAGES = "packages";

	public static final String ATTRIBUTE_JAVASCRIPT_FILE = "javaScriptFile";

	public static final String ATTRIBUTE_STYLESHEET_FILE = "styleSheetFile";

	public static final String ATTRIBUTE_METADATA = "metaData";

	/**
	 * ID属性的属性名。
	 */
	public static final String ATTRIBUTE_ID = "id";

	/**
	 * 布局属性的属性名。
	 */
	public static final String ATTRIBUTE_LAYOUT = "layout";

	/**
	 * 布局条件属性的属性名。
	 */
	public static final String ATTRIBUTE_LAYOUT_CONSTRAINT = "layoutConstraint";

	/**
	 * 参数集合节点。
	 */
	public static final String ARGUMENTS = "Arguments";

	/**
	 * 参数节点。
	 */
	public static final String ARGUMENT = "Argument";

	public static final String CONTEXT = "Context";

	public static final String ATTRIBUTE = "Attribute";
}
