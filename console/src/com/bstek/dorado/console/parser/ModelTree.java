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

import com.bstek.dorado.config.Parser;
import com.bstek.dorado.config.xml.XmlParserHelper;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.data.provider.manager.DataProviderTypeRegisterInfo;
import com.bstek.dorado.data.provider.manager.DataProviderTypeRegistry;
import com.bstek.dorado.data.resolver.manager.DataResolverTypeRegisterInfo;
import com.bstek.dorado.data.resolver.manager.DataResolverTypeRegistry;
/**
 * 
 *
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since  2013-3-4
 */
public class ModelTree {
	
	private List<Node> topNodes = new ArrayList<Node>();
	
	public void build() throws Exception {
		topNodes.clear();
		
		Node datatypeNode = createDataType(new ParserContext());
		topNodes.add(datatypeNode);

		// 处理全局DataProvider节点
		Node providerNode = createDataProvider(new ParserContext());
		topNodes.add(providerNode);

		Node resolverNode = createDataResolver(new ParserContext());
		topNodes.add(resolverNode);
	}
	
	public Collection<Node> getTopNodes() throws Exception {
		return topNodes;
	}

	private Node createDataType(ParserContext parserContext) throws Exception {
		Context context = parserContext.getDoradoContext();
		String beanName = "dataTypeParser";
		
		// 处理全局DataType节点
		Parser parser = (Parser) context.getServiceBean(beanName);
		Node node = new Node(parser, "DataType");

		// 对全局DataType节点挖掘
		node.initProperties();
		parserContext.children(node);
		return node;
	}
	
	private Node createDataProvider(ParserContext parserContext) throws Exception {
		String beanName = "dataProviderTypeRegistry";
		Context context = parserContext.getDoradoContext();
		XmlParserHelper xmlParserHelper = parserContext.getXmlParserHelper();
		
		Node providerNode = new Node("DataProvider");
		DataProviderTypeRegistry registry = (DataProviderTypeRegistry) context.getServiceBean(beanName);
		Collection<DataProviderTypeRegisterInfo> infos = registry.getTypes();
		for (DataProviderTypeRegisterInfo info : infos) {
			String type = info.getType();
			Parser parser = xmlParserHelper.getXmlParser(info.getClassType());
			Node node = new Node(parser, type);
			node.initProperties();
			
			parserContext.children(node);
			providerNode.getChildren().add(node);
		}

		return providerNode;
	}

	private Node createDataResolver(ParserContext parserContext) throws Exception {
		String beanName = "dataResolverTypeRegistry";
		Context context = parserContext.getDoradoContext();
		XmlParserHelper xmlParserHelper = parserContext.getXmlParserHelper();
		
		Node resolverNode = new Node("DataResolver");
		DataResolverTypeRegistry registry = (DataResolverTypeRegistry) context.getServiceBean(beanName);
		
		Collection<DataResolverTypeRegisterInfo> infos = registry.getTypes();
		for (DataResolverTypeRegisterInfo info : infos) {
			String type = info.getType();
			Parser parser = xmlParserHelper.getXmlParser(info.getClassType());
			Node node = new Node(parser, type);
			node.initProperties();
			
			parserContext.children(node);
			resolverNode.getChildren().add(node);
		}

		return resolverNode;
	}
}
