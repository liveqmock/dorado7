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

import java.util.Map;

/**
 * 可配置在Spring中，用于向某DispatchableXmlParser中注册子解析器、子属性解析器的Bean。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apr 2, 2008
 */
public class XmlParserRegister {
	private DispatchableXmlParser dispatchableXmlParser;

	/**
	 * 设置要调整的分派解析器，即要向该分派解析器中注册子解析器、子属性解析器。
	 */
	public void setDispatchableXmlParser(
			DispatchableXmlParser dispatchableXmlParser) {
		this.dispatchableXmlParser = dispatchableXmlParser;
	}

	/**
	 * 设置所有的属性解析器。
	 * @param propertyParsers 属性解析器的映射集合。其中Map的键值为约束条件，值为属性解析器的实例。
	 */
	public void setPropertyParsers(Map<String, XmlParser> propertyParsers) {
		for (Map.Entry<String, XmlParser> entry : propertyParsers.entrySet()) {
			dispatchableXmlParser.registerPropertyParser(entry.getKey(), entry
					.getValue());
		}
	}

	/**
	 * 设置所有的子解析器。
	 * @param subParsers 子解析器的映射集合。其中Map的键值为约束条件，值为子解析器的实例。
	 */
	public void setSubParsers(Map<String, XmlParser> subParsers) {
		for (Map.Entry<String, XmlParser> entry : subParsers.entrySet()) {
			dispatchableXmlParser.registerSubParser(entry.getKey(), entry
					.getValue());
		}
	}
}
