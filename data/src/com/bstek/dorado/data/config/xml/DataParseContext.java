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

import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.Stack;

import org.apache.commons.lang.StringUtils;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.definition.DefaultDefinitionReference;
import com.bstek.dorado.config.definition.DefinitionReference;
import com.bstek.dorado.config.xml.XmlConstants;
import com.bstek.dorado.data.config.definition.DataProviderDefinition;
import com.bstek.dorado.data.config.definition.DataProviderDefinitionManager;
import com.bstek.dorado.data.config.definition.DataResolverDefinition;
import com.bstek.dorado.data.config.definition.DataResolverDefinitionManager;
import com.bstek.dorado.data.config.definition.DataTypeDefinition;
import com.bstek.dorado.data.config.definition.DataTypeDefinitionManager;
import com.bstek.dorado.data.config.definition.DataTypeDefinitionReference;

/**
 * 数据定义配置的解析上下文。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 21, 2007
 */
public class DataParseContext extends ParseContext {
	private String resourceName;
	private String dataObjectIdPrefix = "";

	private Map<String, NodeWrapper> configuredDataTypes = new HashMap<String, NodeWrapper>();
	private Map<String, DataTypeDefinition> parsedDataTypes = new HashMap<String, DataTypeDefinition>();
	private Map<String, NodeWrapper> configuredDataProviders = new HashMap<String, NodeWrapper>();
	private Map<String, DataProviderDefinition> parsedDataProviders = new HashMap<String, DataProviderDefinition>();
	private Map<String, NodeWrapper> configuredDataResolvers = new HashMap<String, NodeWrapper>();
	private Map<String, DataResolverDefinition> parsedDataResolvers = new HashMap<String, DataResolverDefinition>();
	private Set<Node> parsingNodes = new LinkedHashSet<Node>();

	private DataTypeDefinitionManager dataTypeDefinitionManager;
	private DataProviderDefinitionManager dataProviderDefinitionManager;
	private DataResolverDefinitionManager dataResolverDefinitionManager;

	private boolean duringParsingDataElement;
	private Stack<String> privateObjectNameStack = new Stack<String>();
	private Stack<DefinitionReference<DataTypeDefinition>> currentDataTypeStack = new Stack<DefinitionReference<DataTypeDefinition>>();

	public String getResourceName() {
		return resourceName;
	}

	public void setResourceName(String resourceName) {
		this.resourceName = resourceName;
	}

	public String getDataObjectIdPrefix() {
		return dataObjectIdPrefix;
	}

	public void setDataObjectIdPrefix(String dataObjectIdPrefix) {
		this.dataObjectIdPrefix = dataObjectIdPrefix;
	}

	/**
	 * 返回所有配置中定义过的全局DataType的Map集合。其中Map的键为DataType的名称，值为相应的XML节点。
	 */
	public Map<String, NodeWrapper> getConfiguredDataTypes() {
		return configuredDataTypes;
	}

	/**
	 * 返回所有已解析生成的DataType配置声明对象的集合。其中Map的键为DataType的名称，值为相应的配置声明对象。
	 */
	public Map<String, DataTypeDefinition> getParsedDataTypes() {
		return parsedDataTypes;
	}

	/**
	 * 所有配置中定义过的全局DataProvider的Map集合，其中Map的键值为DataProvider的名称，值为相应的XML节点。
	 */
	public Map<String, NodeWrapper> getConfiguredDataProviders() {
		return configuredDataProviders;
	}

	/**
	 * 返回所有已解析生成的DataProvider配置声明对象的集合。其中Map的键为DataProvider的名称，值为相应的配置声明对象。
	 */
	public Map<String, DataProviderDefinition> getParsedDataProviders() {
		return parsedDataProviders;
	}

	/**
	 * 所有配置中定义过的全局DataResolver的Map集合，其中Map的键值为DataResolver的名称，值为相应的XML节点。
	 */
	public Map<String, NodeWrapper> getConfiguredDataResolvers() {
		return configuredDataResolvers;
	}

	/**
	 * 返回所有已解析生成的DataResolver配置声明对象的集合。其中Map的键为DataResolver的名称，值为相应的配置声明对象。
	 */
	public Map<String, DataResolverDefinition> getParsedDataResolvers() {
		return parsedDataResolvers;
	}

	/**
	 * 当前正在解析的顶层节点。此属性主要用于检测配置信息的相互引用，以避免解析程序死锁。
	 */
	public Set<Node> getParsingNodes() {
		return parsingNodes;
	}

	/**
	 * 设置DataType配置声明管理器。
	 */
	public void setDataTypeDefinitionManager(
			DataTypeDefinitionManager dataTypeDefinitionManager) {
		this.dataTypeDefinitionManager = dataTypeDefinitionManager;
	}

	/**
	 * 返回DataType配置声明管理器。
	 */
	public DataTypeDefinitionManager getDataTypeDefinitionManager() {
		return dataTypeDefinitionManager;
	}

	/**
	 * 设置DataProvider配置声明管理器。
	 */
	public void setDataProviderDefinitionManager(
			DataProviderDefinitionManager dataProviderDefinitionManager) {
		this.dataProviderDefinitionManager = dataProviderDefinitionManager;
	}

	/**
	 * 返回DataProvider配置声明管理器。
	 */
	public DataProviderDefinitionManager getDataProviderDefinitionManager() {
		return dataProviderDefinitionManager;
	}

	/**
	 * 设置DataResolver配置声明管理器。
	 */
	public void setDataResolverDefinitionManager(
			DataResolverDefinitionManager dataResolverDefinitionManager) {
		this.dataResolverDefinitionManager = dataResolverDefinitionManager;
	}

	/**
	 * 返回DataResolver配置声明管理器。
	 */
	public DataResolverDefinitionManager getDataResolverDefinitionManager() {
		return dataResolverDefinitionManager;
	}

	/**
	 * 根据DataType的名称生成一个指向某DataType配置声明对象的引用。
	 * 
	 * @param name
	 *            DataType的名称
	 * @return 配置声明对象的引用
	 */
	public DefinitionReference<DataTypeDefinition> getDataTypeReference(
			String name) {
		return new DataTypeDefinitionReference(name);
	}

	private String getFinalDataObjectName(String name, DataParseContext context) {
		if (name.charAt(0) == '#') {
			String resourceName = context.getResourceName();
			if (StringUtils.isNotEmpty(resourceName)) {
				String prefix;
				int i1 = resourceName.lastIndexOf('/');
				int i2 = resourceName.lastIndexOf('.');
				int i = (i1 > i2) ? i1 : i2;
				if (i > 0 && i < (resourceName.length() - 1)) {
					prefix = resourceName.substring(i + 1);
				} else {
					prefix = resourceName;
				}
				name = StringUtils.uncapitalize(prefix) + name;
			}
		}
		return name;
	}

	/**
	 * 根据DataProvider的名称生成一个指向某DataProvider配置声明对象的引用。
	 * 
	 * @param name
	 *            DataProvider的名称
	 * @return 配置声明对象的引用
	 */
	public DefinitionReference<DataProviderDefinition> getDataProviderReference(
			String name, DataParseContext context) {
		name = getFinalDataObjectName(name, context);
		name = name.trim();
		return new DefaultDefinitionReference<DataProviderDefinition>(
				dataProviderDefinitionManager, name);
	}

	/**
	 * 根据DataResolver的名称生成一个指向某DataResolver配置声明对象的引用。
	 * 
	 * @param name
	 *            DataResolver的名称
	 * @return 配置声明对象的引用
	 */
	public DefinitionReference<DataResolverDefinition> getDataResolverReference(
			String name, DataParseContext context) {
		name = getFinalDataObjectName(name, context);
		name = name.trim();
		return new DefaultDefinitionReference<DataResolverDefinition>(
				dataResolverDefinitionManager, name);
	}

	/**
	 * 返回当前是否正在解析数据节点。
	 */
	public boolean isDuringParsingDataElement() {
		return duringParsingDataElement;
	}

	/**
	 * 设置当前是否正在解析数据节点。
	 */
	public void setDuringParsingDataElement(boolean duringParsingDataElement) {
		this.duringParsingDataElement = duringParsingDataElement;
	}

	/**
	 * 返回下级数据节点对应的DataType。
	 */
	public DefinitionReference<DataTypeDefinition> getCurrentDataType() {
		if (!currentDataTypeStack.isEmpty()) {
			return currentDataTypeStack.peek();
		}
		return null;
	}

	/**
	 * 设置下级数据节点对应的DataType。
	 */
	public void setCurrentDataType(
			DefinitionReference<DataTypeDefinition> definitionReference)
			throws Exception {
		currentDataTypeStack.push(definitionReference);
	}

	/**
	 * 还原至堆栈中的前一个DataType。
	 */
	public void restoreCurrentDataType() {
		if (currentDataTypeStack.size() > 0) {
			currentDataTypeStack.pop();
		}
	}

	/**
	 * 返回下级私有数据对象应采用的名称前缀。
	 */
	public String getPrivateNameSection(Node node) {
		String section = null;
		if (node instanceof Element) {
			Element element = (Element) node;
			String keyValue = element.getAttribute(XmlConstants.ATTRIBUTE_ID);
			if (StringUtils.isEmpty(keyValue)) {
				keyValue = element.getAttribute(XmlConstants.ATTRIBUTE_NAME);
			}

			if (StringUtils.isNotEmpty(keyValue)) {
				section = DataXmlConstants.PATH_SUB_OBJECT_PREFIX + keyValue;
			} else {
				section = DataXmlConstants.PATH_PROPERTY_PREFIX
						+ element.getTagName();
			}
		} else {
			section = DataXmlConstants.PATH_PROPERTY_PREFIX
					+ node.getNodeName();
		}
		return section;
	}

	/**
	 * 返回私有对象的命名前缀。
	 */
	public String getPrivateObjectName() {
		if (privateObjectNameStack.size() > 0) {
			return privateObjectNameStack.peek();
		} else {
			return null;
		}
	}

	/**
	 * 设置下级私有数据对象应采用的名称。
	 */
	public void setPrivateObjectName(String name) {
		privateObjectNameStack.push(name);
	}

	/**
	 * 设置下级私有数据对象应采用的名称片段。
	 */
	public String setPrivateObjectNameSection(String section) {
		String prefix = getPrivateObjectName();
		prefix = StringUtils.defaultString(prefix, "");
		String name = prefix + section;
		setPrivateObjectName(name);
		return name;
	}

	/**
	 * 还原至堆栈中的前一个私有对象名称。
	 */
	public void restorePrivateObjectName() {
		if (privateObjectNameStack.size() > 0) {
			privateObjectNameStack.pop();
		}
	}
}
