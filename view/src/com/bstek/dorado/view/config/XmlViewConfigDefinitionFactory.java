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

package com.bstek.dorado.view.config;

import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.bstek.dorado.config.definition.DefinitionManager;
import com.bstek.dorado.config.xml.XmlParser;
import com.bstek.dorado.core.Configure;
import com.bstek.dorado.core.io.EmptyResource;
import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.core.io.ResourceUtils;
import com.bstek.dorado.core.xml.XmlDocumentBuilder;
import com.bstek.dorado.data.Constants;
import com.bstek.dorado.data.config.definition.DataProviderDefinition;
import com.bstek.dorado.data.config.definition.DataProviderDefinitionManager;
import com.bstek.dorado.data.config.definition.DataResolverDefinition;
import com.bstek.dorado.data.config.definition.DataResolverDefinitionManager;
import com.bstek.dorado.data.config.definition.DataTypeDefinition;
import com.bstek.dorado.data.config.definition.DataTypeDefinitionManager;
import com.bstek.dorado.util.PathUtils;
import com.bstek.dorado.util.StringAliasUtils;
import com.bstek.dorado.view.config.definition.ViewConfigDefinition;
import com.bstek.dorado.view.config.xml.PreparseContext;
import com.bstek.dorado.view.config.xml.ViewConfigParserUtils;
import com.bstek.dorado.view.config.xml.ViewParseContext;
import com.bstek.dorado.view.config.xml.ViewXmlConstants;

/**
 * 利用解析XML配置文件从而获得视图配置声明对象的工厂。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apr 1, 2008
 */
public class XmlViewConfigDefinitionFactory implements
		ViewConfigDefinitionFactory {
	private static byte nameDelimDotOrBackLashMode = 1;
	private static byte nameDelimDotMode = 2;
	private static byte nameDelimBackLashMode = 3;

	private static String nameDelimDot = "dot";
	private static String nameDelimBackLash = "backlash";
	private static String nameDelimDotOrBackLash = "dotOrBacklash";

	private XmlDocumentBuilder xmlDocumentBuilder;
	private String pathPrefix;
	private String pathSubfix;
	private byte nameDelimMode = 0;
	private char pathDelimChar = '.';
	private XmlDocumentPreprocessor xmlPreprocessor;
	private XmlParser xmlParser;
	private DataTypeDefinitionManager dataTypeDefinitionManager;
	private DataProviderDefinitionManager dataProviderDefinitionManager;
	private DataResolverDefinitionManager dataResolverDefinitionManager;

	private byte getNameDelimMode() {
		if (nameDelimMode == 0) {
			String setting = Configure.getString("view.viewNameDelim",
					nameDelimDotOrBackLash);
			if (nameDelimDot.equals(setting)) {
				nameDelimMode = nameDelimDotMode;
			} else if (nameDelimBackLash.equals(setting)) {
				nameDelimMode = nameDelimBackLashMode;
			} else {
				nameDelimMode = nameDelimDotOrBackLashMode;
			}
		}
		return nameDelimMode;
	}

	/**
	 * 设置XML配置文件构建类。
	 */
	public void setXmlDocumentBuilder(XmlDocumentBuilder xmlDocumentBuilder) {
		this.xmlDocumentBuilder = xmlDocumentBuilder;
	}

	/**
	 * 返回文件路径的前缀。
	 */
	public String getPathPrefix() {
		return pathPrefix;
	}

	/**
	 * 设置文件路径的前缀。
	 */
	public void setPathPrefix(String pathPrefix) {
		if (pathPrefix.endsWith("/")) {
			pathPrefix = pathPrefix.substring(0, pathPrefix.length() - 1);
		}
		this.pathPrefix = pathPrefix;
	}

	/**
	 * 返回文件路径的后缀。
	 */
	public String getPathSubfix() {
		return pathSubfix;
	}

	/**
	 * 设置文件路径的后缀。
	 */
	public void setPathSubfix(String pathSubfix) {
		this.pathSubfix = pathSubfix;
	}

	public char getPathDelimChar() {
		return pathDelimChar;
	}

	public void setPathDelimChar(char pathDelimChar) {
		this.pathDelimChar = pathDelimChar;
	}

	public void setXmlPreprocessor(XmlDocumentPreprocessor xmlPreprocessor) {
		this.xmlPreprocessor = xmlPreprocessor;
	}

	/**
	 * 设置XML配置文件的根解析器。
	 */
	public void setXmlParser(XmlParser xmlParser) {
		this.xmlParser = xmlParser;
	}

	public void setDataTypeDefinitionManager(
			DataTypeDefinitionManager dataTypeDefinitionManager) {
		this.dataTypeDefinitionManager = dataTypeDefinitionManager;
	}

	public void setDataProviderDefinitionManager(
			DataProviderDefinitionManager dataProviderDefinitionManager) {
		this.dataProviderDefinitionManager = dataProviderDefinitionManager;
	}

	public void setDataResolverDefinitionManager(
			DataResolverDefinitionManager dataResolverDefinitionManager) {
		this.dataResolverDefinitionManager = dataResolverDefinitionManager;
	}

	protected String getResourcePath(String viewName, String pathSubfix)
			throws Exception {
		String runMode = Configure.getString("core.runMode");
		if ("debug".equals(runMode) && StringUtils.isNotEmpty(pathPrefix)
				&& pathPrefix.indexOf(';') > 0) {
			for (String prefix : StringUtils.split(pathPrefix, ';')) {
				String path = getResourcePath(viewName, prefix, pathSubfix);
				Resource resource = ResourceUtils.getResource(path);
				if (null != resource && resource.exists()) {
					return path;
				}
			}
			return null;
		} else {
			return getResourcePath(viewName, pathPrefix, pathSubfix);
		}
	}

	protected Resource getResource(String viewName, String pathSubfix)
			throws Exception {
		String path = getResourcePath(viewName, pathSubfix);
		if (path == null) {
			return EmptyResource.INSTANCE;
		}

		Resource[] resources = ResourceUtils.getResources(path);
		if (resources.length == 0) {
			throw new IllegalArgumentException("Invalid resource path [" + path
					+ "].");
		} else if (resources.length > 1) {
			throw new IllegalArgumentException(
					"More than one resources found by path [" + path + "].");
		}
		return resources[0];
	}

	private String getResourcePath(String viewName, String pathPrefix,
			String pathSubfix) {
		String path = viewName;
		byte delimMode = getNameDelimMode();

		if (delimMode != nameDelimBackLashMode) {
			if (delimMode == nameDelimDotMode && path.indexOf('/') > 0) {
				throw new IllegalArgumentException("Resource[" + path
						+ "] not exists.");
			}
			if (pathDelimChar != PathUtils.PATH_DELIM) {
				path = path.replace(pathDelimChar, PathUtils.PATH_DELIM);
			}
		}
		if (StringUtils.isNotEmpty(pathPrefix)) {
			path = PathUtils.concatPath(pathPrefix, path);
		}
		if (StringUtils.isNotEmpty(pathSubfix)) {
			path += pathSubfix;
		}
		return path;
	}

	protected Resource getResource(String viewName) throws Exception {
		return getResource(viewName, pathSubfix);
	}

	public final ViewConfigInfo getViewConfigInfo(String viewName)
			throws Exception {
		return doGetViewConfigInfo(viewName);
	}

	protected ViewConfigInfo doGetViewConfigInfo(String viewName)
			throws Exception {
		Resource resource = getResource(viewName);
		if (!resource.exists()) {
			throw new ViewNotFoundException(viewName, resource);
		}

		Document document = xmlDocumentBuilder.loadDocument(resource);
		PreparseContext preparseContext = new PreparseContext(viewName);

		Element viewElement = ViewConfigParserUtils.findViewElement(
				document.getDocumentElement(), preparseContext.getResource());
		Resource tempResource;

		if (xmlPreprocessor.getPropertyValue(viewElement,
				ViewXmlConstants.ATTRIBUTE_PAGE_TEMPALTE) == null) {
			tempResource = getResource(viewName, ".html");
			if (tempResource.exists()) {
				viewElement.setAttribute(
						ViewXmlConstants.ATTRIBUTE_PAGE_TEMPALTE,
						getResourcePath(viewName, ".html"));
			}
		}

		tempResource = getResource(viewName, ".js");
		if (tempResource.exists()) {
			String originJavaScriptFile = xmlPreprocessor.getPropertyValue(
					viewElement, ViewXmlConstants.ATTRIBUTE_JAVASCRIPT_FILE);
			String javaScriptFile = getResourcePath(viewName, ".js");
			viewElement.setAttribute(
					ViewXmlConstants.ATTRIBUTE_JAVASCRIPT_FILE, (StringUtils
							.isEmpty(originJavaScriptFile) ? javaScriptFile
							: originJavaScriptFile + ',' + javaScriptFile));
		}

		tempResource = getResource(viewName, ".css");
		if (tempResource.exists()) {
			String originStyleSheetFile = xmlPreprocessor.getPropertyValue(
					viewElement, ViewXmlConstants.ATTRIBUTE_STYLESHEET_FILE);
			String styleSheetFile = getResourcePath(viewName, ".css");
			viewElement.setAttribute(
					ViewXmlConstants.ATTRIBUTE_STYLESHEET_FILE, (StringUtils
							.isEmpty(originStyleSheetFile) ? styleSheetFile
							: originStyleSheetFile + ',' + styleSheetFile));
		}

		document = xmlPreprocessor.process(viewName, document);
		return new ViewConfigInfo(viewName, resource, document);
	}

	public final ViewConfigDefinition create(String viewName) throws Exception {
		return doCreate(viewName);
	}

	protected ViewConfigDefinition doCreate(String viewName) throws Exception {
		ViewConfigInfo viewConfigInfo = getViewConfigInfo(viewName);
		Document document = (Document) viewConfigInfo.getConfigModel();

		ViewParseContext parseContext = new ViewParseContext();
		parseContext.setResourceName(viewName);
		parseContext.setResource(viewConfigInfo.getResource());

		String viewObjectNamePrefix = ViewXmlConstants.PATH_VIEW_SHORT_NAME
				+ Constants.PRIVATE_DATA_OBJECT_SUBFIX
				+ StringAliasUtils.getUniqueAlias(viewName)
				+ ViewXmlConstants.PATH_COMPONENT_PREFIX;
		parseContext.setDataObjectIdPrefix(viewObjectNamePrefix);

		PrivateDataTypeDefinitionManager privateDataTypeDefinitionManager = new PrivateDataTypeDefinitionManager(
				dataTypeDefinitionManager);
		privateDataTypeDefinitionManager
				.setDataObjectIdPrefix(viewObjectNamePrefix);
		parseContext
				.setDataTypeDefinitionManager(privateDataTypeDefinitionManager);

		PrivateDataProviderDefinitionManager privateDataProviderDefinitionManager = new PrivateDataProviderDefinitionManager(
				dataProviderDefinitionManager);
		privateDataProviderDefinitionManager
				.setDataObjectIdPrefix(viewObjectNamePrefix);
		parseContext
				.setDataProviderDefinitionManager(privateDataProviderDefinitionManager);

		PrivateDataResolverDefinitionManager privateDataResolverDefinitionManager = new PrivateDataResolverDefinitionManager(
				dataResolverDefinitionManager);
		privateDataResolverDefinitionManager
				.setDataObjectIdPrefix(viewObjectNamePrefix);
		parseContext
				.setDataResolverDefinitionManager(privateDataResolverDefinitionManager);

		Element documentElement = document.getDocumentElement();
		ViewConfigDefinition viewConfigDefinition = (ViewConfigDefinition) xmlParser
				.parse(documentElement, parseContext);

		DefinitionManager<DataTypeDefinition> dataTypeDefinitionManager = viewConfigDefinition
				.getDataTypeDefinitionManager();
		Map<String, DataTypeDefinition> parsedDataTypes = parseContext
				.getParsedDataTypes();
		for (Map.Entry<String, DataTypeDefinition> entry : parsedDataTypes
				.entrySet()) {
			dataTypeDefinitionManager.registerDefinition(entry.getKey(),
					entry.getValue());
		}

		DefinitionManager<DataProviderDefinition> dataProviderDefinitionManager = viewConfigDefinition
				.getDataProviderDefinitionManager();
		for (Map.Entry<String, DataProviderDefinition> entry : parseContext
				.getParsedDataProviders().entrySet()) {
			dataProviderDefinitionManager.registerDefinition(entry.getKey(),
					entry.getValue());
		}

		DefinitionManager<DataResolverDefinition> dataResolverDefinitionManager = viewConfigDefinition
				.getDataResolverDefinitionManager();
		for (Map.Entry<String, DataResolverDefinition> entry : parseContext
				.getParsedDataResolvers().entrySet()) {
			dataResolverDefinitionManager.registerDefinition(entry.getKey(),
					entry.getValue());
		}
		return viewConfigDefinition;
	}

}
