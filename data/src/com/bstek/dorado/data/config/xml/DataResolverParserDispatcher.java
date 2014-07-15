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

import java.util.Map;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.xml.XmlConstants;
import com.bstek.dorado.config.xml.XmlParseException;
import com.bstek.dorado.config.xml.XmlParser;
import com.bstek.dorado.config.xml.XmlParserHelper;
import com.bstek.dorado.data.Constants;
import com.bstek.dorado.data.config.definition.DataResolverDefinition;
import com.bstek.dorado.data.resolver.DataResolver;
import com.bstek.dorado.data.resolver.manager.DataResolverTypeRegisterInfo;
import com.bstek.dorado.data.resolver.manager.DataResolverTypeRegistry;

/**
 * DataResolver解析任务的分派器。
 * 该分派器会根据某DataResolver节点的类型将具体的解析任务分派给相应的DataResolver解析器进行解析。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 13, 2008
 */
public class DataResolverParserDispatcher extends GenericParser {
	private DataResolverTypeRegistry dataResolverTypeRegistry;
	private XmlParserHelper xmlParserHelper;

	/**
	 * 设置DataResolver的类型注册管理器。
	 */
	public void setDataResolverTypeRegistry(
			DataResolverTypeRegistry dataResolverTypeRegistry) {
		this.dataResolverTypeRegistry = dataResolverTypeRegistry;
	}

	public void setXmlParserHelper(XmlParserHelper xmlParserHelper) {
		this.xmlParserHelper = xmlParserHelper;
	}

	protected boolean shouldProcessImport() {
		return false;
	}

	@Override
	protected Object doParse(Node node, ParseContext context) throws Exception {
		Element element = (Element) node;
		DataParseContext dataContext = (DataParseContext) context;
		Set<Node> parsingNodes = dataContext.getParsingNodes();
		Map<String, DataResolverDefinition> parsedDataResolvers = dataContext
				.getParsedDataResolvers();

		String name = element.getAttribute(XmlConstants.ATTRIBUTE_NAME);
		NodeWrapper nodeWrapper = null;
		if (!StringUtils.isEmpty(name)) {
			nodeWrapper = dataContext.getConfiguredDataResolvers().get(name);
		}
		boolean isGlobal = (nodeWrapper != null && nodeWrapper.getNode() == node);

		DataResolverDefinition dataResolver = null;
		if (!StringUtils.isEmpty(name) && isGlobal) {
			// Comment 11/04/26 为了处理View中私有DataObject与Global DataObject重名的问题
			// DefinitionManager<DataResolverDefinition>
			// dataResolverDefinitionManager = dataContext
			// .getDataResolverDefinitionManager();
			// DataResolverDefinition dataResolver =
			// dataResolverDefinitionManager
			// .getDefinition(name);
			// if (dataResolver == null) {
			// dataResolver = parsedDataResolvers.get(name);
			// }
			dataResolver = parsedDataResolvers.get(name);
			if (dataResolver != null) {
				return dataResolver;
			}
		}

		XmlParser parser = null;
		String type = element
				.getAttribute(DataXmlConstants.ATTRIBUTE_RESOLVER_TYPE);
		DataResolverTypeRegisterInfo registryInfo = dataResolverTypeRegistry
				.getTypeRegistryInfo(type);
		if (registryInfo != null) {
			Class<? extends DataResolver> classType = registryInfo
					.getClassType();
			parser = xmlParserHelper.getXmlParser(classType);
		} else {
			throw new XmlParseException("Unrecognized DataResolver type["
					+ type + "].", element, context);
		}

		if (parser == null) {
			throw new XmlParseException(
					"Can not get Parser for DataResolver of [" + type
							+ "] type.", element, context);
		}

		if (isGlobal) {
			parsingNodes.add(element);
			dataContext
					.setPrivateObjectName(Constants.PRIVATE_DATA_OBJECT_PREFIX
							+ DataXmlConstants.PATH_DATE_RESOLVER_SHORT_NAME
							+ Constants.PRIVATE_DATA_OBJECT_SUBFIX + name);

			dataResolver = (DataResolverDefinition) parser.parse(node,
					dataContext);

			dataContext.restorePrivateObjectName();
			parsingNodes.clear();
		} else {
			String privateNameSection = dataContext.getPrivateNameSection(node);
			if (privateNameSection != null) {
				dataContext.setPrivateObjectNameSection(privateNameSection);
			}
			name = dataContext.getPrivateObjectName();

			dataResolver = (DataResolverDefinition) parser.parse(node, context);

			if (privateNameSection != null) {
				dataContext.restorePrivateObjectName();
			}
		}

		if (dataResolver != null) {
			dataResolver.setName(name);
			parsedDataResolvers.put(name, dataResolver);
		}
		return dataResolver;
	}
}
