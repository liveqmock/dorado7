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

import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.Parser;

/**
 * XML解析器的通用接口。
 * <p>
 * 一个XML解析器通常只完成一些较为简单的解析功能。例如：对某一种XML节点的解析。<br>
 * 对整个XML文件的解析工作往往需要一组相互配合的XmlParser的实现类来完成。
 * </p>
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 20, 2007
 * @see com.bstek.dorado.config.ParseContext
 */
public interface XmlParser extends Parser {
	/**
	 * 解析某个XML节点，并返回解析结果。
	 * @param node 要解析的XML节点。
	 * @param context 解析的上下文对象。
	 * @return 解析结果。
	 * @throws Exception
	 */
	Object parse(Node node, ParseContext context) throws Exception;
}
