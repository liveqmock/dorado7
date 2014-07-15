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

import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.xml.ConfigurableDispatchableXmlParser;

/**
 * 数据配置文件中各种解析器的通用抽象类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 13, 2008
 */
public abstract class GenericParser extends ConfigurableDispatchableXmlParser {
	protected DataObjectParseHelper dataObjectParseHelper;

	public void setDataObjectParseHelper(
			DataObjectParseHelper dataObjectParseHelper) {
		this.dataObjectParseHelper = dataObjectParseHelper;
	}

	@Override
	protected Object doParse(Node node, ParseContext context) throws Exception {
		DataParseContext dataContext = (DataParseContext) context;
		String privateNameSection = dataContext.getPrivateNameSection(node);
		if (privateNameSection != null) {
			dataContext.setPrivateObjectNameSection(privateNameSection);
		}

		Object object = internalParse(node, dataContext);

		if (privateNameSection != null) {
			dataContext.restorePrivateObjectName();
		}
		return object;
	}

	/**
	 * 内部使用的XML节点解析方法。
	 * 
	 * @param node
	 *            要解析的XML节点
	 * @param context
	 *            解析的上下文对象
	 * @return 解析结果
	 * @throws Exception
	 */
	protected Object internalParse(Node node, DataParseContext context)
			throws Exception {
		return node.getNodeValue();
	}

}
