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

package com.bstek.dorado.idesupport.robot;

import java.beans.PropertyDescriptor;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import org.apache.commons.beanutils.PropertyUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.bstek.dorado.config.xml.XmlConstants;
import com.bstek.dorado.config.xml.XmlParser;
import com.bstek.dorado.config.xml.XmlParserHelper;
import com.bstek.dorado.core.CommonContext;
import com.bstek.dorado.core.Configure;
import com.bstek.dorado.core.ConfigureStore;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.data.config.DataConfigManager;
import com.bstek.dorado.data.config.definition.DataProviderDefinitionManager;
import com.bstek.dorado.data.config.definition.DataResolverDefinitionManager;
import com.bstek.dorado.data.config.definition.DataTypeDefinition;
import com.bstek.dorado.data.config.definition.DataTypeDefinitionManager;
import com.bstek.dorado.data.config.xml.DataParseContext;
import com.bstek.dorado.data.config.xml.DataXmlConstants;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.data.type.EntityDataType;
import com.bstek.dorado.data.type.manager.DataTypeManager;
import com.bstek.dorado.util.xml.DomUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-11-2
 */
@Deprecated
public class EntityDataTypeReflectionRobot implements Robot {
	private final static String CONFIG_LOCATIONS = "com/bstek/dorado/core/context.xml,"
			+ "com/bstek/dorado/config/context.xml,"
			+ "com/bstek/dorado/common/context.xml,"
			+ "com/bstek/dorado/data/context.xml";
	private static final Set<String> IGNORE_DATATYPES = new HashSet<String>();

	static {
		IGNORE_DATATYPES.add("Object");
		IGNORE_DATATYPES.add("Map");
		IGNORE_DATATYPES.add("Record");
	}

	public Node execute(Node node, Properties properties) throws Exception {
		ConfigureStore configureStore = Configure.getStore();
		configureStore.set("core.contextConfigLocation", CONFIG_LOCATIONS);
		CommonContext.init();
		try {
			Context context = Context.getCurrent();

			XmlParserHelper xmlParserHelper = (XmlParserHelper) context
					.getServiceBean("xmlParserHelper");
			XmlParser dataTypeParser = xmlParserHelper
					.getXmlParser(EntityDataType.class);

			DataConfigManager dataConfigManager = (DataConfigManager) context
					.getServiceBean("dataConfigManager");
			dataConfigManager.initialize();

			DataParseContext parseContext = new DataParseContext();
			parseContext
					.setDataTypeDefinitionManager((DataTypeDefinitionManager) context
							.getServiceBean("dataTypeDefinitionManager"));
			parseContext
					.setDataProviderDefinitionManager((DataProviderDefinitionManager) context
							.getServiceBean("dataProviderDefinitionManager"));
			parseContext
					.setDataResolverDefinitionManager((DataResolverDefinitionManager) context
							.getServiceBean("dataResolverDefinitionManager"));

			DataTypeDefinition dataTypeDefinition = (DataTypeDefinition) dataTypeParser
					.parse(node, parseContext);

			Class<?> matchType = dataTypeDefinition.getMatchType();
			if (matchType != null) {
				if (matchType == null || matchType.isPrimitive()
						|| matchType.isArray()) {
					throw new IllegalArgumentException(
							"[matchType] undefined or not a valid class.");
				}
				node = node.cloneNode(true);
				reflectAndComplete((Element) node, matchType);
			}
		} finally {
			CommonContext.dispose();
		}
		return node;
	}

	protected void reflectAndComplete(Element element, Class<?> cls)
			throws Exception {
		Context context = Context.getCurrent();
		DataTypeManager dataTypeManager = (DataTypeManager) context
				.getServiceBean("dataTypeManager");
		Document document = element.getOwnerDocument();

		Map<String, Element> propertyDefElementMap = new HashMap<String, Element>();
		for (Element propertyDefElement : DomUtils.getChildrenByTagName(
				element, DataXmlConstants.PROPERTY_DEF)) {
			String name = propertyDefElement
					.getAttribute(XmlConstants.ATTRIBUTE_NAME);
			propertyDefElementMap.put(name, propertyDefElement);
		}

		PropertyDescriptor[] propertyDescriptors = PropertyUtils
				.getPropertyDescriptors(cls);
		for (PropertyDescriptor propertyDescriptor : propertyDescriptors) {
			String name = propertyDescriptor.getName();
			if ("class".equals(name))
				continue;
			Element propertyDefElement = propertyDefElementMap.get(name);
			if (propertyDefElement == null) {
				String dataTypeName = null;

				DataType propertyDataType = dataTypeManager
						.getDataType(propertyDescriptor.getPropertyType());
				if (propertyDataType != null) {
					dataTypeName = propertyDataType.getName();
					if (IGNORE_DATATYPES.contains(dataTypeName)) {
						continue;
					}
				}

				propertyDefElement = document
						.createElement(DataXmlConstants.PROPERTY_DEF);
				propertyDefElement.setAttribute(XmlConstants.ATTRIBUTE_NAME,
						name);
				createPropertyElement(propertyDefElement,
						DataXmlConstants.ATTRIBUTE_DATA_TYPE, dataTypeName);
				element.appendChild(propertyDefElement);
			}
		}
	}

	private Element createPropertyElement(Element parentElement,
			String propertyName) {
		Document document = parentElement.getOwnerDocument();
		Element propertyElement = document.createElement("Property");
		propertyElement.setAttribute(XmlConstants.ATTRIBUTE_NAME, propertyName);
		parentElement.appendChild(propertyElement);
		return propertyElement;
	}

	private Element createPropertyElement(Element parentElement,
			String propertyName, String propertyValue) {
		Element propertyElement = createPropertyElement(parentElement,
				propertyName);
		propertyElement.setTextContent(propertyValue);
		return propertyElement;
	}
}
