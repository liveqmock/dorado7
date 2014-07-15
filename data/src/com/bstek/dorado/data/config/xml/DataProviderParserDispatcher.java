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
import com.bstek.dorado.data.config.definition.DataProviderDefinition;
import com.bstek.dorado.data.provider.DataProvider;
import com.bstek.dorado.data.provider.manager.DataProviderTypeRegisterInfo;
import com.bstek.dorado.data.provider.manager.DataProviderTypeRegistry;

/**
 * DataProvider解析任务的分派器。
 * 该分派器会根据某DataProvider节点的类型将具体的解析任务分派给相应的DataProvider解析器进行解析。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 13, 2008
 */
public class DataProviderParserDispatcher extends GenericParser {
	private DataProviderTypeRegistry dataProviderTypeRegistry;
	private XmlParserHelper xmlParserHelper;

	/**
	 * 设置DataProvider的类型注册管理器。
	 */
	public void setDataProviderTypeRegistry(
			DataProviderTypeRegistry dataProviderTypeRegistry) {
		this.dataProviderTypeRegistry = dataProviderTypeRegistry;
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
		Map<String, DataProviderDefinition> parsedDataProviders = dataContext
				.getParsedDataProviders();

		String name = element.getAttribute(XmlConstants.ATTRIBUTE_NAME);
		NodeWrapper nodeWrapper = null;
		if (!StringUtils.isEmpty(name)) {
			nodeWrapper = dataContext.getConfiguredDataProviders().get(name);
		}
		boolean isGlobal = (nodeWrapper != null && nodeWrapper.getNode() == node);

		DataProviderDefinition dataProvider = null;
		if (!StringUtils.isEmpty(name) && isGlobal) {
			// Comment 11/04/26 为了处理View中私有DataObject与Global DataObject重名的问题
			// DefinitionManager<DataProviderDefinition>
			// dataProviderDefinitionManager = dataContext
			// .getDataProviderDefinitionManager();
			// DataProviderDefinition dataProvider =
			// dataProviderDefinitionManager
			// .getDefinition(name);
			// if (dataProvider == null) {
			// dataProvider = parsedDataProviders.get(name);
			// }
			dataProvider = parsedDataProviders.get(name);
			if (dataProvider != null) {
				return dataProvider;
			}
		}

		XmlParser parser = null;
		String type = element
				.getAttribute(DataXmlConstants.ATTRIBUTE_PROVIDER_TYPE);
		DataProviderTypeRegisterInfo registryInfo = dataProviderTypeRegistry
				.getTypeRegistryInfo(type);
		if (registryInfo != null) {
			Class<? extends DataProvider> classType = registryInfo
					.getClassType();
			parser = xmlParserHelper.getXmlParser(classType);
		} else {
			throw new XmlParseException("Unrecognized DataProvider type["
					+ type + "].", element, context);
		}

		if (parser == null) {
			throw new XmlParseException(
					"Can not get Parser for DataProvider of [" + type
							+ "] type.", element, context);
		}

		if (isGlobal) {
			parsingNodes.add(element);
			dataContext
					.setPrivateObjectName(Constants.PRIVATE_DATA_OBJECT_PREFIX
							+ DataXmlConstants.PATH_DATE_PROVIDER_SHORT_NAME
							+ Constants.PRIVATE_DATA_OBJECT_SUBFIX + name);

			dataProvider = (DataProviderDefinition) parser.parse(node,
					dataContext);

			dataContext.restorePrivateObjectName();
			parsingNodes.clear();
		} else {
			String privateNameSection = dataContext.getPrivateNameSection(node);
			if (privateNameSection != null) {
				dataContext.setPrivateObjectNameSection(privateNameSection);
			}
			name = dataContext.getPrivateObjectName();

			dataProvider = (DataProviderDefinition) parser.parse(node, context);

			if (privateNameSection != null) {
				dataContext.restorePrivateObjectName();
			}
		}

		if (dataProvider != null) {
			dataProvider.setName(name);
			parsedDataProviders.put(name, dataProvider);
		}
		return dataProvider;
	}
}
