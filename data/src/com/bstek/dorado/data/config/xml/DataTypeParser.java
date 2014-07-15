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
import com.bstek.dorado.config.definition.DefinitionReference;
import com.bstek.dorado.config.definition.ObjectDefinition;
import com.bstek.dorado.config.xml.ObjectParser;
import com.bstek.dorado.config.xml.ObjectParserInitializationAware;
import com.bstek.dorado.config.xml.XmlConstants;
import com.bstek.dorado.config.xml.XmlParseException;
import com.bstek.dorado.core.Configure;
import com.bstek.dorado.data.Constants;
import com.bstek.dorado.data.config.definition.DataTypeDefinition;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.data.type.EntityDataType;
import com.bstek.dorado.util.clazz.ClassUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-11-17
 */
public class DataTypeParser extends GenericObjectParser implements
		ObjectParserInitializationAware {

	@Override
	@SuppressWarnings("unchecked")
	protected DefinitionReference<DataTypeDefinition>[] getParentDefinitionReferences(
			String parentNameText, ParseContext context) throws Exception {
		DefinitionReference<DataTypeDefinition>[] parentReferences;
		String[] parentNames = StringUtils.split(parentNameText, ',');
		parentReferences = new DefinitionReference[parentNames.length];

		DataParseContext dataContext = (DataParseContext) context;
		for (int i = 0; i < parentNames.length; i++) {
			dataContext
					.setPrivateObjectNameSection(DataXmlConstants.PATH_PROPERTY_PREFIX
							+ XmlConstants.ATTRIBUTE_PARENT + (i + 1));
			try {
				String parentName = parentNames[i];
				DefinitionReference<DataTypeDefinition> dataTypeRef = dataObjectParseHelper
						.getDataTypeByName(parentName, dataContext, true);
				parentReferences[i] = dataTypeRef;
			} finally {
				dataContext.restorePrivateObjectName();
			}
		}
		return parentReferences;
	}

	@Override
	protected void initDefinition(ObjectDefinition definition, Element element,
			ParseContext context) throws Exception {
		DataTypeDefinition dataType = (DataTypeDefinition) definition;
		super.initDefinition(dataType, element, context);

		DataParseContext dataContext = (DataParseContext) context;
		DefinitionReference<DataTypeDefinition> dataTypeRef;
		dataTypeRef = dataObjectParseHelper.getReferencedDataType(
				DataXmlConstants.ATTRIBUTE_ELEMENT_DATA_TYPE, element,
				dataContext);
		if (dataTypeRef != null) {
			dataType.setProperty(DataXmlConstants.ATTRIBUTE_ELEMENT_DATA_TYPE,
					dataTypeRef);
		}

		dataTypeRef = dataObjectParseHelper.getReferencedDataType(
				DataXmlConstants.ATTRIBUTE_KEY_DATA_TYPE, element, dataContext);
		if (dataTypeRef != null) {
			dataType.setProperty(DataXmlConstants.ATTRIBUTE_KEY_DATA_TYPE,
					dataTypeRef);
		}

		dataTypeRef = dataObjectParseHelper.getReferencedDataType(
				DataXmlConstants.ATTRIBUTE_VALUE_DATA_TYPE, element,
				dataContext);
		if (dataTypeRef != null) {
			dataType.setProperty(DataXmlConstants.ATTRIBUTE_VALUE_DATA_TYPE,
					dataTypeRef);
		}
	}

	@SuppressWarnings("unchecked")
	@Override
	protected Object internalParse(Node node, ParseContext context)
			throws Exception {
		Element element = (Element) node;
		DataParseContext dataContext = (DataParseContext) context;
		Set<Node> parsingNodes = dataContext.getParsingNodes();
		Map<String, DataTypeDefinition> parsedDataTypes = dataContext
				.getParsedDataTypes();

		String name = element.getAttribute(XmlConstants.ATTRIBUTE_NAME);
		if (StringUtils.isEmpty(name)) {
			throw new XmlParseException("DataType name undefined.", element,
					context);
		}

		DataTypeDefinition dataType = parsedDataTypes.get(name);
		if (dataType != null) {
			return dataType;
		}

		parsingNodes.add(element);
		dataContext.setPrivateObjectName(Constants.PRIVATE_DATA_OBJECT_PREFIX
				+ DataXmlConstants.PATH_DATE_TYPE_SHORT_NAME
				+ Constants.PRIVATE_DATA_OBJECT_SUBFIX + name);

		dataType = (DataTypeDefinition) super.internalParse(node, dataContext);

		Class<?> matchType = (Class<?>) dataType
				.removeProperty(DataXmlConstants.ATTRIBUTE_MATCH_TYPE);
		dataType.setMatchType(matchType);

		Class<?> creationType = (Class<?>) dataType
				.removeProperty(DataXmlConstants.ATTRIBUTE_CREATION_TYPE);
		if (creationType != null) {
			if (matchType != null && !matchType.isAssignableFrom(creationType)) {
				throw new XmlParseException("The CreationType [" + creationType
						+ "] is not a sub type of the MatchType [" + matchType
						+ "].", element, context);
			}
			dataType.setCreationType(creationType);
		}

		dataContext.restorePrivateObjectName();
		parsingNodes.clear();

		dataType.setName(name);

		final String DEFAULT_DATATYPE_PARENT = Configure.getString(
				"data.defaultEntityDataTypeParent", "Entity");
		if (dataType.getParentReferences() == null
				&& !DEFAULT_DATATYPE_PARENT.equals(name)) {
			boolean useDefaultParent = false;
			String impl = dataType.getImpl();
			if (StringUtils.isNotEmpty(impl)) {
				Class<? extends DataType> type = ClassUtils.forName(impl);
				useDefaultParent = EntityDataType.class.isAssignableFrom(type);
			} else {
				useDefaultParent = true;
			}

			if (useDefaultParent) {
				DefinitionReference<?> dataTypeRef = dataContext
						.getDataTypeReference(DEFAULT_DATATYPE_PARENT);
				dataType.setParentReferences(new DefinitionReference[] { dataTypeRef });
			}
		}

		parsedDataTypes.put(name, dataType);
		return dataType;
	}

	public void postObjectParserInitialized(ObjectParser objectParser)
			throws Exception {
		setImpl(null);
	}
}
