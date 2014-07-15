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

package com.bstek.dorado.console.parser;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import com.bstek.dorado.annotation.DataProvider;
import com.bstek.dorado.config.xml.XmlParser;
import com.bstek.dorado.config.xml.XmlParserHelper;
import com.bstek.dorado.config.xml.XmlParserHelper.XmlParserInfo;
import com.bstek.dorado.util.clazz.ClassUtils;
/**
 * 
 *
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since  2013-3-4
 */
public class ParserTree {

	@DataProvider
	public Collection<Node> getModelNodes() throws Exception {
		ModelTree modelTree = new ModelTree();
		modelTree.build();
		
		return modelTree.getTopNodes();
	}

	@DataProvider
	public Collection<Node> getViewConfigNodes() throws Exception {
		ViewTree viewTree = new ViewTree();
		viewTree.build();
		
		return viewTree.getTopNodes();
	}
	
	@DataProvider
	public Collection<Node> getTopNodes(String className) throws Exception {
		ParserContext parserContext = new ParserContext();
		XmlParserHelper xmlParserHelper = parserContext.getXmlParserHelper();
		Class<?> beanType = ClassUtils.forName(className);
		List<Node> topNodes = new ArrayList<Node>();
		List<XmlParserInfo> parserInfos = xmlParserHelper.getXmlParserInfos(beanType);
		for (XmlParserInfo parserInfo: parserInfos) {
			XmlParser parser = parserInfo.getParser();
			String name = parserInfo.getPath();
			Node node = new Node(parser, name);
			node.initProperties();
			parserContext.children(node);
			
			topNodes.add(node);
		}
		
		return topNodes;
	}
}
