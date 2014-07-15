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

import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.xml.XmlParser;
import com.bstek.dorado.data.config.xml.DataObjectParserDispatcher;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-11-24
 */
public class ModelParser implements XmlParser {
	private XmlParser dataObjectPreloadParser;
	private DataObjectParserDispatcher dataObjectParserDispatcher;

	public void setDataObjectPreloadParser(XmlParser dataObjectsPreloadParser) {
		this.dataObjectPreloadParser = dataObjectsPreloadParser;
	}

	public void setDataObjectParserDispatcher(
			DataObjectParserDispatcher dataObjectParserDispatcher) {
		this.dataObjectParserDispatcher = dataObjectParserDispatcher;
	}

	public Object parse(Node node, ParseContext context) throws Exception {
		dataObjectPreloadParser.parse(node, context);
		dataObjectParserDispatcher.parse(null, context);
		return null;
	}

}
