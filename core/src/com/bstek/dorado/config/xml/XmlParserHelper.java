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

package com.bstek.dorado.config.xml;

import java.beans.PropertyDescriptor;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javassist.Modifier;

import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.BeanFactoryAware;
import org.springframework.beans.factory.ListableBeanFactory;
import org.w3c.dom.Node;

import com.bstek.dorado.annotation.ExpressionMode;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.annotation.XmlNodeWrapper;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.annotation.XmlSubNode;
import com.bstek.dorado.common.event.ClientEventSupported;
import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.text.TextParser;
import com.bstek.dorado.config.text.TextParserHelper;
import com.bstek.dorado.core.bean.BeanFactoryUtils;
import com.bstek.dorado.core.bean.BeanWrapper;
import com.bstek.dorado.core.bean.Scope;
import com.bstek.dorado.util.clazz.ClassUtils;
import com.bstek.dorado.util.clazz.TypeInfo;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-11-12
 */
public class XmlParserHelper implements BeanFactoryAware {
	private static final String WILCARD = "*";
	private static final String SELF = "#self";

	private static final String DEFAULT_PARSER = "spring:dorado.prototype.objectParser";
	private static final String IGNORE_PARSER = "dorado.ignoreParser";
	private static final String UNSUPPORT_PARSER = "dorado.unsupportParser";
	private static final String COMPOSITE_PROPERTY_PARSER = "dorado.prototype.compositePropertyParser";
	private static final String CLASS_TYPE_PROPERTY_PARSER = "dorado.classTypePropertyParser";
	private static final String STRING_ARRAY_PROPERTY_PARSER = "dorado.stringArrayPropertyParser";
	private static final String DATA_PROPERTY_PARSER = "dorado.dataParser";
	private static final String STATIC_PROPERTY_PARSER = "dorado.staticPropertyParser";

	private static final String CLIENT_EVENT_PARSER = "dorado.clientEventParser";
	private static final String SUB_NODE_TO_PROPERTY_PARSER = "dorado.prototype.subNodeToPropertyParser";
	private static final String COLLECTION_TO_PROPERTY_PARSER = "dorado.prototype.collectionToPropertyParser";

	@SuppressWarnings("unchecked")
	private static List<XmlParserInfo> EMPTY_XML_PARSER_INFOS = Collections.EMPTY_LIST;

	public static class XmlParserInfo {
		private String path;
		private XmlParser parser;

		public XmlParserInfo(String path, XmlParser parser) {
			this.path = path;
			this.parser = parser;
		}

		public XmlParserInfo(String nodeName, String fixedProperties,
				XmlParser parser) {
			String path;
			if (StringUtils.isEmpty(fixedProperties)) {
				path = nodeName;
			} else {
				path = nodeName + '[' + fixedProperties + ']';
			}
			this.path = path;
			this.parser = parser;
		}

		public String getPath() {
			return path;
		}

		public XmlParser getParser() {
			return parser;
		}

	}

	protected static class MockParser implements XmlParser {
		private Class<?> beanType;
		private String wrapperParser;
		private String property;

		public MockParser(Class<?> beanType) {
			this.beanType = beanType;
		}

		public Class<?> getBeanType() {
			return beanType;
		}

		public String getWrapperParser() {
			return wrapperParser;
		}

		public void setWrapperParser(String wrapperParser) {
			this.wrapperParser = wrapperParser;
		}

		public String getProperty() {
			return property;
		}

		public void setProperty(String property) {
			this.property = property;
		}

		public Object parse(Node node, ParseContext context) throws Exception {
			throw new UnsupportedOperationException();
		}

	}

	protected static class Context {
		private Set<Class<?>> processingStack = new HashSet<Class<?>>();
		private Set<XmlParser> processingParsers = new HashSet<XmlParser>();

		public Set<Class<?>> getProcessingStack() {
			return processingStack;
		}

		public Set<XmlParser> getProcessingParsers() {
			return processingParsers;
		}

	}

	protected static class XmlNodeInfo {
		private Class<?> type;
		private List<Class<?>> sourceTypes;

		private String nodeName;
		private Set<String> implTypes = new HashSet<String>();
		private String definitionType;
		private boolean scopable;
		private boolean inheritable;
		private String parser;
		private Map<String, String> fixedProperties = new HashMap<String, String>();
		private Map<String, XmlProperty> properties = new HashMap<String, XmlProperty>();
		private Set<XmlSubNode> subNodes = new HashSet<XmlSubNode>();

		public XmlNodeInfo(Class<?> type) {
			this.type = type;
		}

		public Class<?> getType() {
			return type;
		}

		public void addSourceType(Class<?> sourceType) {
			if (sourceTypes == null) {
				sourceTypes = new ArrayList<Class<?>>();
			}
			sourceTypes.add(sourceType);
		}

		public List<Class<?>> getSourceTypes() {
			return sourceTypes;
		}

		public String getNodeName() {
			return nodeName;
		}

		public void setNodeName(String nodeName) {
			this.nodeName = nodeName;
		}

		public Set<String> getImplTypes() {
			return implTypes;
		}

		public String getDefinitionType() {
			return definitionType;
		}

		public void setDefinitionType(String definitionType) {
			this.definitionType = definitionType;
		}

		public boolean isScopable() {
			return scopable;
		}

		public void setScopable(boolean scopable) {
			this.scopable = scopable;
		}

		public boolean isInheritable() {
			return inheritable;
		}

		public void setInheritable(boolean inheritable) {
			this.inheritable = inheritable;
		}

		public String getParser() {
			return parser;
		}

		public void setParser(String parser) {
			this.parser = parser;
		}

		public Map<String, String> getFixedProperties() {
			return fixedProperties;
		}

		public String getFixedPropertiesExpression() {
			StringBuffer buf = new StringBuffer();
			for (Map.Entry<String, String> entry : fixedProperties.entrySet()) {
				if ((buf.length() > 0)) {
					buf.append(';');
				}
				buf.append(entry.getKey()).append('=').append(entry.getValue());
			}
			return (buf.length() > 0) ? buf.toString() : null;
		}

		public Map<String, XmlProperty> getProperties() {
			return properties;
		}

		public Set<XmlSubNode> getSubNodes() {
			return subNodes;
		}
	}

	protected BeanFactory beanFactory;
	private TextParserHelper textParserHelper;
	private Set<ObjectParser> initializedObjectParsers = new HashSet<ObjectParser>();
	private Map<Class<?>, List<XmlParserInfo>> xmlParserInfoCache = new HashMap<Class<?>, List<XmlParserInfo>>();
	private Map<Class<?>, XmlNodeInfo> xmlNodeInfoCache = new HashMap<Class<?>, XmlNodeInfo>();

	public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
		this.beanFactory = beanFactory;
	}

	public void setTextParserHelper(TextParserHelper textParserHelper) {
		this.textParserHelper = textParserHelper;
	}

	public List<XmlParserInfo> getXmlParserInfos(Class<?> beanType)
			throws Exception {
		synchronized (beanType) {
			if (xmlParserInfoCache.containsKey(beanType)) {
				return xmlParserInfoCache.get(beanType);
			}
	
			Context context = new Context();
			List<XmlParserInfo> xmlParserInfos = getSubNodeXmlParserInfosByPropertyType(
					context, beanType);
			for (XmlParserInfo xmlParserInfo : xmlParserInfos) {
				XmlParser parser = xmlParserInfo.getParser();
				if (parser instanceof DispatchableXmlParser) {
					processMockParsers(context, (DispatchableXmlParser) parser);
				}
			}
			return (xmlParserInfos == null) ? EMPTY_XML_PARSER_INFOS
					: xmlParserInfos;
		}
	}

	public XmlParser getXmlParser(Class<?> beanType) throws Exception {
		List<XmlParserInfo> xmlParserInfos = getXmlParserInfos(beanType);
		if (xmlParserInfos != null && !xmlParserInfos.isEmpty()) {
			return xmlParserInfos.get(0).getParser();
		} else {
			return null;
		}
	}

	void initObjectParser(ObjectParser objectParser) throws Exception {
		initObjectParser(objectParser, null);
	}

	protected void initObjectParser(ObjectParser objectParser, Class<?> beanType)
			throws Exception {
		if (initializedObjectParsers.contains(objectParser)) {
			return;
		}

		if (beanType == null && !StringUtils.isEmpty(objectParser.getImpl())) {
			beanType = ClassUtils.forName(objectParser.getImpl());
		}
		if (beanType != null) {
			XmlNodeInfo xmlNodeInfo = getXmlNodeInfo(beanType);
			if (xmlNodeInfo != null
					|| objectParser instanceof CompositePropertyParser) {
				Context context = new Context();
				initObjectParser(context, objectParser, xmlNodeInfo, beanType);
			}
		}
	}

	protected XmlNodeInfo getXmlNodeInfo(Class<?> type) {
		if (xmlNodeInfoCache.containsKey(type)) {
			return xmlNodeInfoCache.get(type);
		}

		XmlNodeInfo xmlNodeInfo = new XmlNodeInfo(type);
		doGetXmlNodeInfo(xmlNodeInfo, type);
		if (StringUtils.isEmpty(xmlNodeInfo.getNodeName())
				|| "#className".equals(xmlNodeInfo.getNodeName())) {
			xmlNodeInfo.setNodeName(type.getSimpleName());
		}
		if (xmlNodeInfo.getSourceTypes() == null) {
			xmlNodeInfo = null;
		}

		xmlNodeInfoCache.put(type, xmlNodeInfo);
		return xmlNodeInfo;
	}

	private void doGetXmlNodeInfo(XmlNodeInfo xmlNodeInfo, Class<?> type) {
		for (Class<?> i : type.getInterfaces()) {
			doGetXmlNodeInfo(xmlNodeInfo, i);
		}

		Class<?> superclass = type.getSuperclass();
		if (superclass != null && !superclass.equals(Object.class)) {
			doGetXmlNodeInfo(xmlNodeInfo, superclass);
		}

		collectXmlNodeInfo(xmlNodeInfo, type);
	}

	private void collectXmlNodeInfo(XmlNodeInfo xmlNodeInfo, Class<?> type) {
		XmlNode xmlNode = type.getAnnotation(XmlNode.class);
		if (xmlNode == null) {
			return;
		}
		xmlNodeInfo.addSourceType(type);

		if (StringUtils.isNotEmpty(xmlNode.nodeName())) {
			xmlNodeInfo.setNodeName(xmlNode.nodeName());
		}

		if (type.equals(xmlNodeInfo.getType())) {
			for (String implType : xmlNode.implTypes()) {
				if (StringUtils.isNotEmpty(implType)) {
					xmlNodeInfo.getImplTypes().add(implType);
				}
			}
		}

		if (StringUtils.isNotEmpty(xmlNode.definitionType())) {
			xmlNodeInfo.setDefinitionType(xmlNode.definitionType());
		}
		if (!xmlNodeInfo.isScopable() && xmlNode.scopable()) {
			xmlNodeInfo.setScopable(true);
		}
		if (!xmlNodeInfo.isInheritable() && xmlNode.inheritable()) {
			xmlNodeInfo.setInheritable(true);
		}
		if (StringUtils.isNotEmpty(xmlNode.parser())) {
			xmlNodeInfo.setParser(xmlNode.parser());
		}
		if (StringUtils.isNotEmpty(xmlNode.fixedProperties())) {
			Map<String, String> fixedProperties = xmlNodeInfo
					.getFixedProperties();
			for (String fixedProperty : StringUtils.split(
					xmlNode.fixedProperties(), ",;")) {
				int i = fixedProperty.indexOf('=');
				if (i > 0) {
					String property = fixedProperty.substring(0, i);
					fixedProperties.put(property,
							fixedProperty.substring(i + 1));
				}
			}
		}

		Map<String, XmlProperty> properties = xmlNodeInfo.getProperties();
		XmlProperty[] annotationProperties = xmlNode.properties();
		boolean hasPropertyAnnotation = false;
		if (annotationProperties.length == 1) {
			XmlProperty xmlProperty = annotationProperties[0];
			hasPropertyAnnotation = StringUtils.isNotEmpty(xmlProperty
					.propertyName())
					|| StringUtils.isNotEmpty(xmlProperty.propertyType())
					|| StringUtils.isNotEmpty(xmlProperty.parser());
		} else if (annotationProperties.length > 1) {
			hasPropertyAnnotation = true;
		}

		if (hasPropertyAnnotation) {
			for (XmlProperty xmlProperty : annotationProperties) {
				if (StringUtils.isEmpty(xmlProperty.propertyName())) {
					throw new IllegalArgumentException(
							"@XmlProperty.propertyName undefined. ["
									+ type.getName() + "]");
				}
				for (String property : StringUtils.split(
						xmlProperty.propertyName(), ",;")) {
					properties.put(property, xmlProperty);
				}
			}
		}

		Set<XmlSubNode> subNodes = xmlNodeInfo.getSubNodes();
		XmlSubNode[] annotationSubNodes = xmlNode.subNodes();
		boolean hasSubNodeAnnotation = (annotationSubNodes.length > 0);
		if (annotationSubNodes.length == 1) {
			XmlSubNode xmlSubNode = annotationSubNodes[0];
			hasSubNodeAnnotation = StringUtils.isNotEmpty(xmlSubNode
					.propertyName())
					|| StringUtils.isNotEmpty(xmlSubNode.nodeName())
					|| StringUtils.isNotEmpty(xmlSubNode.propertyType());
		}
		if (hasSubNodeAnnotation) {
			for (XmlSubNode xmlSubNode : annotationSubNodes) {
				if (!(StringUtils.isNotEmpty(xmlSubNode.propertyType()) || (StringUtils
						.isNotEmpty(xmlSubNode.nodeName()) && StringUtils
						.isNotEmpty(xmlSubNode.parser())))) {
					throw new IllegalArgumentException(
							"Neither @XmlSubNode.propertyType nor @XmlSubNode.nodeName/@XmlSubNode.parser undefined. ["
									+ type.getName() + "]");
				}
				subNodes.add(xmlSubNode);
			}
		}
	}

	private void processMockParsers(Context context,
			DispatchableXmlParser parentParser) throws Exception {
		if (context.getProcessingParsers().contains(parentParser)) {
			return;
		}
		context.getProcessingParsers().add(parentParser);

		boolean hasMockParser = false;
		Map<String, XmlParser> subParsers = parentParser.getSubParsers();
		for (XmlParser parser : subParsers.values()) {
			if (parser instanceof MockParser) {
				hasMockParser = true;
				break;
			}
		}

		if (hasMockParser) {
			Map<String, XmlParser> newParserMap = new LinkedHashMap<String, XmlParser>();
			for (Map.Entry<String, XmlParser> entry : subParsers.entrySet()) {
				String path = entry.getKey();
				XmlParser parser = entry.getValue();
				if (parser instanceof MockParser) {
					MockParser mockParser = (MockParser) parser;
					List<XmlParserInfo> xmlParserInfos = xmlParserInfoCache
							.get(mockParser.getBeanType());
					if (xmlParserInfos != null) {
						String wrapperParserConfig = mockParser
								.getWrapperParser();
						if (StringUtils.isNotEmpty(wrapperParserConfig)) {
							for (XmlParserInfo xmlParserInfo : xmlParserInfos) {
								DispatchableXmlParser wrapperParser;
								wrapperParser = beanFactory.getBean(
										wrapperParserConfig,
										DispatchableXmlParser.class);
								BeanUtils.setProperty(wrapperParser,
										"property", mockParser.getProperty());
								wrapperParser.registerSubParser(SELF,
										xmlParserInfo.getParser());

								int i = path.lastIndexOf('/');
								if (i > 0) {
									path = path.substring(0, i + 1)
											+ xmlParserInfo.getPath();
								} else {
									path = xmlParserInfo.getPath();
								}

								newParserMap.put(path, wrapperParser);
							}
						} else {
							for (XmlParserInfo xmlParserInfo : xmlParserInfos) {
								newParserMap.put(xmlParserInfo.getPath(),
										xmlParserInfo.getParser());
							}
						}
					}
				} else {
					newParserMap.put(path, parser);
				}
			}

			subParsers.clear();
			subParsers.putAll(newParserMap);
		}

		for (XmlParser parser : subParsers.values()) {
			if (parser instanceof DispatchableXmlParser) {
				processMockParsers(context, (DispatchableXmlParser) parser);
			}
		}
	}

	private List<XmlParserInfo> doGetXmlParserInfos(Context context,
			Class<?> beanType) throws Exception {
		XmlNodeInfo xmlNodeInfo = getXmlNodeInfo(beanType);
		List<XmlParserInfo> xmlParserInfos = null;
		if (xmlNodeInfo != null) {
			xmlParserInfos = doGetXmlParserInfos(context, beanType, xmlNodeInfo);
		}
		if (xmlParserInfos == null) {
			xmlParserInfos = EMPTY_XML_PARSER_INFOS;
		}
		return xmlParserInfos;
	}

	private List<XmlParserInfo> doGetXmlParserInfos(Context context,
			Class<?> beanType, XmlNodeInfo xmlNodeInfo) throws Exception {
		Set<String> implTypes = xmlNodeInfo.getImplTypes();
		if (implTypes.isEmpty()) {
			return doGetXmlParserInfosByBeanType(context, beanType, xmlNodeInfo);
		} else {
			List<XmlParserInfo> xmlParserInfos = new ArrayList<XmlParserInfo>();
			for (String implType : implTypes) {
				if (StringUtils.isNotEmpty(implType)) {
					collectConcereteXmlParsersByImplExpression(context,
							beanType, implType, xmlParserInfos, null);
				}
			}
			return xmlParserInfos;
		}
	}

	private List<XmlParserInfo> doGetXmlParserInfosByBeanType(Context context,
			Class<?> beanType, XmlNodeInfo xmlNodeInfo) throws Exception {
		if (xmlParserInfoCache.containsKey(beanType)) {
			return xmlParserInfoCache.get(beanType);
		}

		if (context.getProcessingStack().contains(beanType)) {
			MockParser mockParser = new MockParser(beanType);
			List<XmlParserInfo> xmlParserInfos = new ArrayList<XmlParserInfo>();
			xmlParserInfos.add(new XmlParserInfo(ObjectUtils
					.identityToString(mockParser), mockParser));
			return xmlParserInfos;
		}

		context.getProcessingStack().add(beanType);
		try {
			String nodeName = xmlNodeInfo.getNodeName();
			if (StringUtils.isEmpty(nodeName)) {
				nodeName = beanType.getSimpleName();
			}

			String parserExpression = xmlNodeInfo.getParser();
			if (StringUtils.isEmpty(parserExpression)) {
				parserExpression = DEFAULT_PARSER;
			}

			BeanWrapper beanWrapper = BeanFactoryUtils.getBean(
					parserExpression, Scope.instant);
			XmlParser parser = (XmlParser) beanWrapper.getBean();
			if (parser instanceof ObjectParser) {
				ObjectParser objectParser = (ObjectParser) parser;
				initObjectParser(context, objectParser, xmlNodeInfo, beanType);
			}

			List<XmlParserInfo> xmlParserInfos = new ArrayList<XmlParserInfo>();
			xmlParserInfos.add(new XmlParserInfo(nodeName, xmlNodeInfo
					.getFixedPropertiesExpression(), parser));
			xmlParserInfoCache.put(beanType, xmlParserInfos);
			return xmlParserInfos;
		} finally {
			context.getProcessingStack().remove(beanType);
		}
	}

	private final void initObjectParser(Context context,
			ObjectParser objectParser, XmlNodeInfo xmlNodeInfo,
			Class<?> beanType) throws Exception {
		if (initializedObjectParsers.contains(objectParser)) {
			return;
		}
		initializedObjectParsers.add(objectParser);
		doInitObjectParser(context, objectParser, xmlNodeInfo, beanType);
	}

	protected void doInitObjectParser(Context context,
			ObjectParser objectParser, XmlNodeInfo xmlNodeInfo,
			Class<?> beanType) throws Exception {
		objectParser.setAnnotationOwnerType(beanType);
		if (!Modifier.isAbstract(beanType.getModifiers())) {
			objectParser.setImpl(beanType.getName());
		}

		if (xmlNodeInfo != null) {
			if (StringUtils.isNotEmpty(xmlNodeInfo.getDefinitionType())) {
				objectParser.setDefinitionType(xmlNodeInfo.getDefinitionType());
			}

			Map<String, XmlParser> propertyParsers = objectParser
					.getPropertyParsers();
			Map<String, XmlParser> subParsers = objectParser.getSubParsers();

			if (!(objectParser instanceof CompositePropertyParser)) {
				boolean inheritable = objectParser.isInheritable()
						|| xmlNodeInfo.isInheritable();
				objectParser.setInheritable(inheritable);
				if (inheritable) {
					if (propertyParsers.get("parent") == null) {
						objectParser.registerPropertyParser("parent",
								beanFactory.getBean(IGNORE_PARSER,
										XmlParser.class));
					}
				}

				boolean scopable = objectParser.isScopable()
						|| xmlNodeInfo.isScopable();
				objectParser.setScopable(scopable);
				if (scopable) {
					if (propertyParsers.get("scope") == null) {
						objectParser.registerPropertyParser("scope",
								beanFactory.getBean(IGNORE_PARSER,
										XmlParser.class));
					}
				}

				for (String fixedProperty : xmlNodeInfo.getFixedProperties()
						.keySet()) {
					if (propertyParsers.get(fixedProperty) == null) {
						objectParser.registerPropertyParser(fixedProperty,
								beanFactory.getBean(IGNORE_PARSER,
										XmlParser.class));
					}
				}
			}

			for (XmlSubNode xmlSubNode : xmlNodeInfo.getSubNodes()) {
				if (StringUtils.isNotEmpty(xmlSubNode.propertyType())) {
					List<XmlParserInfo> xmlParserInfos = getSubNodeXmlParserInfos(
							context, beanType, xmlSubNode.propertyName(), null,
							xmlSubNode);
					if (xmlParserInfos != null) {
						for (XmlParserInfo xmlParserInfo : xmlParserInfos) {
							objectParser.registerSubParser(
									xmlParserInfo.getPath(),
									xmlParserInfo.getParser());
						}
					}
				} else if (StringUtils.isNotEmpty(xmlSubNode.nodeName())
						&& StringUtils.isNotEmpty(xmlSubNode.parser())) {
					BeanWrapper beanWrapper = BeanFactoryUtils.getBean(
							xmlSubNode.parser(), Scope.instant);
					objectParser.registerSubParser(xmlSubNode.nodeName(),
							(XmlParser) beanWrapper.getBean());
				}
			}

			for (Map.Entry<String, XmlProperty> entry : xmlNodeInfo
					.getProperties().entrySet()) {
				XmlProperty xmlProperty = entry.getValue();
				XmlParserInfo xmlParserInfo = getPropertyXmlParserInfo(context,
						beanType, xmlProperty.propertyName(), null, xmlProperty);
				if (xmlParserInfo != null) {
					objectParser.registerPropertyParser(
							xmlParserInfo.getPath(), xmlParserInfo.getParser());
				}
			}

			if (ClientEventSupported.class.isAssignableFrom(beanType)
					&& subParsers.get("ClientEvent") == null) {
				objectParser.registerSubParser("ClientEvent", beanFactory
						.getBean(CLIENT_EVENT_PARSER, XmlParser.class));
			}
		}

		PropertyDescriptor[] propertyDescriptors = PropertyUtils
				.getPropertyDescriptors(beanType);
		for (PropertyDescriptor propertyDescriptor : propertyDescriptors) {
			String propertyName = propertyDescriptor.getName();
			if ("class".equals(propertyName)) {
				continue;
			}

			Method readMethod = propertyDescriptor.getReadMethod();
			if (readMethod == null) {
				continue;
			}
			if (readMethod.getDeclaringClass() != beanType) {
				try {
					readMethod = beanType.getMethod(readMethod.getName(),
							readMethod.getParameterTypes());
				} catch (NoSuchMethodException e) {
					// do nothing
				}
			}

			TypeInfo typeInfo;
			Class<?> propertyType = propertyDescriptor.getPropertyType();
			if (Collection.class.isAssignableFrom(propertyType)) {
				typeInfo = TypeInfo.parse(
						(ParameterizedType) readMethod.getGenericReturnType(),
						true);
				propertyType = typeInfo.getType();
			} else {
				typeInfo = new TypeInfo(propertyType, false);
			}

			XmlSubNode xmlSubNode = readMethod.getAnnotation(XmlSubNode.class);
			if (xmlSubNode != null) {
				if (StringUtils.isNotEmpty(xmlSubNode.propertyName())) {
					throw new IllegalArgumentException(
							"@XmlSubNode.propertyName should be empty. ["
									+ beanType.getName() + '#' + propertyName
									+ "]");
				}

				List<XmlParserInfo> xmlParserInfos = getSubNodeXmlParserInfos(
						context, beanType, propertyName, typeInfo, xmlSubNode);
				if (xmlParserInfos != null) {
					for (XmlParserInfo xmlParserInfo : xmlParserInfos) {
						objectParser.registerSubParser(xmlParserInfo.getPath(),
								xmlParserInfo.getParser());
					}
				}
			} else {
				XmlProperty xmlProperty = readMethod
						.getAnnotation(XmlProperty.class);
				if (xmlProperty != null
						&& StringUtils.isNotEmpty(xmlProperty.propertyName())) {
					throw new IllegalArgumentException(
							"@XmlProperty.propertyName should be empty. ["
									+ beanType.getName() + '#' + propertyName
									+ "]");
				}

				XmlParserInfo xmlParserInfo = getPropertyXmlParserInfo(context,
						beanType, propertyName, typeInfo, xmlProperty);
				if (xmlParserInfo != null) {
					XmlParser parser = xmlParserInfo.getParser();
					if (parser instanceof TextPropertyParser) {
						TextPropertyParser textPropertyParser = (TextPropertyParser) parser;
						if (textPropertyParser.getTextParser() == null) {
							TextParser textParser = textParserHelper
									.getTextParser(propertyType);
							textPropertyParser.setTextParser(textParser);
						}
					}
					objectParser.registerPropertyParser(
							xmlParserInfo.getPath(), parser);
				}
			}
		}

		if (objectParser instanceof ObjectParserInitializationAware) {
			((ObjectParserInitializationAware) objectParser)
					.postObjectParserInitialized(objectParser);
		}

		Map<String, XmlParserHelperListener> listenerMap = ((ListableBeanFactory) beanFactory)
				.getBeansOfType(XmlParserHelperListener.class);
		for (XmlParserHelperListener listener : listenerMap.values()) {
			listener.onInitParser(this, objectParser, beanType);
		}
	}

	protected XmlParserInfo getPropertyXmlParserInfo(Context context,
			Class<?> beanType, String propertyName, TypeInfo typeInfo,
			XmlProperty xmlProperty) throws Exception {
		XmlParser propertyParser = null;

		Class<?> propertyType = (typeInfo != null) ? typeInfo.getType() : null;
		if (xmlProperty != null) {
			if (StringUtils.isNotEmpty(xmlProperty.propertyType())) {
				typeInfo = TypeInfo.parse(xmlProperty.propertyType());
				propertyType = typeInfo.getType();
			}
			if (StringUtils.isNotEmpty(xmlProperty.propertyType())) {
				propertyType = ClassUtils.forName(xmlProperty.propertyType());
			}

			if (xmlProperty.unsupported()) {
				propertyParser = beanFactory.getBean(UNSUPPORT_PARSER,
						XmlParser.class);
			} else if (xmlProperty.ignored()) {
				propertyParser = beanFactory.getBean(IGNORE_PARSER,
						XmlParser.class);
			} else if (StringUtils.isNotEmpty(xmlProperty.parser())) {
				propertyParser = (XmlParser) BeanFactoryUtils
						.getBean(xmlProperty.parser());
			} else {
				if (xmlProperty.composite()) {
					CompositePropertyParser compositePropertyParser = beanFactory
							.getBean(COMPOSITE_PROPERTY_PARSER,
									CompositePropertyParser.class);

					compositePropertyParser.setImpl(propertyType.getName());
					compositePropertyParser.setOpen(Map.class
							.isAssignableFrom(propertyType));
					if (!compositePropertyParser.isOpen()) {
						initObjectParser(compositePropertyParser);
					}

					propertyParser = compositePropertyParser;
				} else {
					ExpressionMode expressionMode = xmlProperty
							.expressionMode();
					if (ExpressionMode.NORMAL.equals(expressionMode)) {
						propertyParser = beanFactory.getBean(
								STATIC_PROPERTY_PARSER, XmlParser.class);
					}
				}
			}
		}

		if (propertyParser == null && propertyType != null) {
			if (propertyType.equals(Class.class)) {
				propertyParser = beanFactory.getBean(
						CLASS_TYPE_PROPERTY_PARSER, XmlParser.class);
			} else if (propertyType.isArray()
					&& propertyType.getComponentType().equals(String.class)) {
				propertyParser = beanFactory.getBean(
						STRING_ARRAY_PROPERTY_PARSER, XmlParser.class);
			} else if (propertyType.equals(Object.class)) {
				propertyParser = beanFactory.getBean(DATA_PROPERTY_PARSER,
						XmlParser.class);
			}
		}

		if (propertyParser != null) {
			return new XmlParserInfo(propertyName, propertyParser);
		} else {
			return null;
		}
	}

	protected List<XmlParserInfo> getSubNodeXmlParserInfos(Context context,
			Class<?> beanType, String propertyName, TypeInfo typeInfo,
			XmlSubNode xmlSubNode) throws Exception {
		List<XmlParserInfo> xmlParserInfos;

		if (StringUtils.isNotEmpty(xmlSubNode.propertyType())) {
			typeInfo = TypeInfo.parse(xmlSubNode.propertyType());
		}
		Class<?> propertyType = typeInfo.getType();

		xmlParserInfos = new ArrayList<XmlParserInfo>();
		String nodeName = xmlSubNode.nodeName();
		if (StringUtils.isNotEmpty(nodeName)
				&& StringUtils.isNotEmpty(xmlSubNode.parser())) {
			XmlParser subParser = (XmlParser) BeanFactoryUtils
					.getBean(xmlSubNode.parser());
			XmlParserInfo parserInfo = new XmlParserInfo(nodeName, subParser);
			xmlParserInfos.add(parserInfo);
		} else {
			String[] implTypes = xmlSubNode.implTypes();
			Set<Class<?>> blackTypes = null;

			for (String implType : implTypes) {
				if (StringUtils.isNotEmpty(implType)) {
					if (blackTypes == null) {
						blackTypes = new HashSet<Class<?>>();
						blackTypes.add(beanType);
					}

					collectConcereteXmlParsersByImplExpression(context,
							propertyType, implType, xmlParserInfos, blackTypes);
				}
			}
			List<XmlParserInfo> xpis = getSubNodeXmlParserInfosByPropertyType(
					context, propertyType);
			if (xpis != null) {
				xmlParserInfos.addAll(xpis);
			}

			if (StringUtils.isNotEmpty(nodeName)
					&& !nodeName.contains(DispatchableXmlParser.WILDCARD)
					&& !xmlParserInfos.isEmpty()) {
				if (xmlParserInfos.size() == 1) {
					XmlParserInfo parserInfo = xmlParserInfos.get(0);
					xmlParserInfos.set(0, new XmlParserInfo(nodeName,
							parserInfo.getParser()));
				} else {
					throw new IllegalArgumentException(
							"Assign nodeName for mora than one parse. ["
									+ beanType.getName() + "." + propertyName
									+ "], [" + nodeName + "].");
				}
			}
		}

		XmlNodeWrapper wrapper = xmlSubNode.wrapper();
		if (!xmlParserInfos.isEmpty() && StringUtils.isNotEmpty(propertyName)) {
			int size = xmlParserInfos.size();
			for (int i = 0; i < size; i++) {
				XmlParserInfo xmlParserInfo = xmlParserInfos.get(i);
				XmlParser subParser = xmlParserInfo.getParser();
				String path = xmlParserInfo.getPath();
				if (StringUtils.isNotEmpty(wrapper.nodeName())) {
					path = wrapper.nodeName() + '/' + path;
				}

				if (!xmlSubNode.resultProcessed()) {
					if (subParser instanceof MockParser) {
						MockParser mockParser = (MockParser) subParser;
						mockParser
								.setWrapperParser((typeInfo.isAggregated()) ? COLLECTION_TO_PROPERTY_PARSER
										: SUB_NODE_TO_PROPERTY_PARSER);
						mockParser.setProperty(propertyName);
						XmlParserInfo mockParserInfo = new XmlParserInfo(path,
								mockParser);
						xmlParserInfos.set(i, mockParserInfo);
					} else {
						DispatchableXmlParser wrapperParser;
						if (typeInfo.isAggregated()) {
							wrapperParser = (DispatchableXmlParser) beanFactory
									.getBean(COLLECTION_TO_PROPERTY_PARSER);
						} else {
							wrapperParser = (DispatchableXmlParser) beanFactory
									.getBean(SUB_NODE_TO_PROPERTY_PARSER);
						}
						BeanUtils.setProperty(wrapperParser, "property",
								propertyName);

						wrapperParser.registerSubParser(SELF, subParser);
						XmlParserInfo wrapperParserInfo = new XmlParserInfo(
								path, wrapperParser);
						xmlParserInfos.set(i, wrapperParserInfo);
					}
				}
			}
		}
		return xmlParserInfos;
	}

	protected List<XmlParserInfo> getSubNodeXmlParserInfosByPropertyType(
			Context context, Class<?> propertyType) throws Exception {
		return doGetXmlParserInfos(context, propertyType);
	}

	private void collectConcereteXmlParsersByImplExpression(Context context,
			Class<?> targetType, String implExpression,
			List<XmlParserInfo> xmlParserInfos, Set<Class<?>> blackTypes)
			throws Exception {
		if (implExpression.indexOf(WILCARD) >= 0) {
			Set<Class<?>> implTypes = ClassUtils.findClassTypes(implExpression,
					targetType);
			for (Class<?> implType : implTypes) {
				if (blackTypes == null || !blackTypes.contains(implType)) {
					collectConcereteXmlParsersByClassName(context, targetType,
							implType, xmlParserInfos, false);
				}
			}
		} else {
			try {
				Class<?> implType = ClassUtils.forName(implExpression);
				if (implType != null
						&& (blackTypes == null || !blackTypes
								.contains(implType))) {
					collectConcereteXmlParsersByClassName(context, targetType,
							implType, xmlParserInfos, true);
				}
			} catch (ClassNotFoundException e) {
				// do nothing
			}
		}
	}

	private void collectConcereteXmlParsersByClassName(Context context,
			Class<?> targetType, Class<?> implType,
			List<XmlParserInfo> xmlParserInfos, boolean checkType)
			throws Exception {
		if (Modifier.isAbstract(implType.getModifiers())
				|| !targetType.isAssignableFrom(implType)) {
			if (checkType) {
				throw new IllegalArgumentException(implType.getName()
						+ " is not a sub type of " + targetType.getName() + ".");
			}
			return;
		}

		XmlNodeInfo concereteXmlNodeInfo = getXmlNodeInfo(implType);
		if (concereteXmlNodeInfo != null) {
			for (XmlParserInfo xmlParserInfo : doGetXmlParserInfosByBeanType(
					context, implType, concereteXmlNodeInfo)) {
				xmlParserInfos.add(xmlParserInfo);
			}
		}
	}
}
