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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.StringUtils;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;

import com.bstek.dorado.config.ConfigUtils;
import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.core.el.ExpressionHandler;
import com.bstek.dorado.util.Assert;
import com.bstek.dorado.util.PathUtils;
import com.bstek.dorado.util.proxy.ChildrenMapSupport;
import com.bstek.dorado.util.xml.DomUtils;

/**
 * XML分派解析器。<br>
 * 可支持将XML节点中各个属性和子节点的解析任务分派到相应子解析器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 20, 2007
 */
public class DispatchableXmlParser implements XmlParser {
	public static final String SELF = "#self";
	public static final char SUB_PARSER_PATH_SEPERATOR = '/';

	/**
	 * 默认解析器的约束条件。<br>
	 * 该约束条件表示如果根据某约束条件无法找到匹配的解析器，那么就使用与{@link #WILDCARD}相关的解析器。
	 */
	public static final String WILDCARD = "*";

	private Map<String, XmlParser> propertyParsers = new LinkedHashMap<String, XmlParser>();
	private SubParserMap subParsers = new SubParserMap();

	/**
	 * 返回EL表达式的处理器。
	 */
	protected ExpressionHandler getExpressionHandler() {
		return null;
	}

	/**
	 * 向当前解析器中注册一个属性解析器。
	 * 
	 * @param constraint
	 *            要注册的属性解析器的约束条件。如果此参数的值为null，那么系统将使用{@link #WILDCARD}
	 *            作为内部使用的约束条件。
	 * @param parser
	 *            属性解析器
	 */
	public void registerPropertyParser(String constraint, XmlParser parser) {
		Assert.notNull(parser, "[parser] is required");
		propertyParsers.put(constraint, parser);
	}

	/**
	 * 返回所有已注册的属性解析器。其中Map的键值是约束条件，值是属性解析器。
	 * 
	 * @return 属性解析器的Map集合。
	 */
	public Map<String, XmlParser> getPropertyParsers() {
		return propertyParsers;
	}

	/**
	 * 根据约束条件返回一个匹配的属性解析器。
	 * 
	 * @param constraint
	 *            约束条件。 如果无法直接通过约束条件找到一个匹配的子解析器，那么此方法将尝试返回WILDCARD相关的子解析器。
	 */
	protected XmlParser findPropertyParser(String constraint) {
		constraint = StringUtils.defaultString(constraint, WILDCARD);
		XmlParser parser = propertyParsers.get(constraint);
		if (parser == null && !WILDCARD.equals(constraint)) {
			parser = propertyParsers.get(WILDCARD);
		}
		return parser;
	}

	/**
	 * 向当前解析器中注册一个子解析器。
	 * 
	 * @param constraint
	 *            要注册的子解析器的约束条件。如果此参数的值为null，那么系统将使用WILDCARD作为内部使用的约束条件。
	 * @param parser
	 *            子解析器
	 */
	public void registerSubParser(String constraint, XmlParser parser) {
		Assert.notNull(parser, "[parser] is required");
		subParsers.put(constraint, parser);
	}

	/**
	 * 返回所有已注册的子解析器。 其中Map的键值是约束条件，值是子解析器。
	 * 
	 * @return 子解析器的Map集合。
	 */
	public Map<String, XmlParser> getSubParsers() {
		return subParsers;
	}

	/**
	 * 根据约束条件返回一个匹配的子解析器。
	 * 
	 * @param constraint
	 *            约束条件。 如果无法直接通过约束条件找到一个匹配的子解析器，那么此方法将尝试返回WILDCARD相关的子解析器。
	 */
	protected XmlParser findSubParser(String constraint) {
		constraint = StringUtils.defaultString(constraint, WILDCARD);
		XmlParser parser = subParsers.get(constraint);
		if (parser == null && !WILDCARD.equals(constraint)) {
			parser = subParsers.get(WILDCARD);
		}
		return parser;
	}

	public final Object parse(Node node, ParseContext context) throws Exception {
		if (!subParsers.cacheBuilded) {
			subParsers.buildCache();
		}

		return doParse(node, context);
	}

	protected Object doParse(Node node, ParseContext context) throws Exception {
		if (node instanceof Element) {
			return dispatchChildElements((Element) node, context);
		} else {
			return null;
		}
	}

	private boolean isTagElement(Element element) {
		String nodeName = element.getNodeName();
		return (XmlConstants.PROPERTY.equals(nodeName)
				|| XmlConstants.GROUP_START.equals(nodeName)
				|| XmlConstants.GROUP_END.equals(nodeName)
				|| XmlConstants.IMPORT.equals(nodeName)
				|| XmlConstants.PLACE_HOLDER.equals(nodeName)
				|| XmlConstants.PLACE_HOLDER_START.equals(nodeName) || XmlConstants.PLACE_HOLDER_END
					.equals(nodeName));
	}
	
	/**
	 * 遍历所有子节点并将解析任务分派给各个已注册的子解析器，并将所有子解析器返回的解析结果以List的方式返回。
	 * 
	 * @param element
	 *            要解析的XML节点
	 * @param context
	 *            解析的上下文对象
	 * @return 解析结果
	 * @throws Exception
	 */
	protected List<?> dispatchChildElements(Element element,
			ParseContext context) throws Exception {
		List<Object> results = new ArrayList<Object>();
		for (Element childElement : DomUtils.getChildElements(element)) {
			if (!isTagElement(childElement)) {
				Object value = dispatchElement(null, childElement, context);
				if (value != ConfigUtils.IGNORE_VALUE) {
					results.add(value);
				}
			}
		}

		if (subParsers.hasDeepParser) {
			Set<String> parsedPaths = new HashSet<String>();
			for (Map.Entry<String, ParserInfo> entry : subParsers.subParserInfoMap
					.entrySet()) {
				String path = entry.getKey();
				ParserInfo parserInfo = entry.getValue();
				XmlParser subParser = parserInfo.getParser();
				PathSection[] pathSections = parserInfo.getPathSections();
				if (pathSections.length > 1) {
					dispatchChildElementsWithConditionalPath(results,
							parsedPaths, pathSections, 0, null, element,
							context);
				} else if (SELF.equals(path)) {
					Object value = subParser.parse(element, context);
					if (value != ConfigUtils.IGNORE_VALUE) {
						results.add(value);
					}
				}
			}
		} else {
			XmlParser subParser = subParsers.get(SELF);
			if (subParser != null) {
				Object value = subParser.parse(element, context);
				if (value != ConfigUtils.IGNORE_VALUE) {
					results.add(value);
				}
			}
		}
		return results;
	}

	private void dispatchChildElementsWithConditionalPath(List<Object> results,
			Set<String> parsedPaths, PathSection[] pathSections, int deepth,
			String pathPrefix, Element element, ParseContext context)
			throws Exception {
		if (deepth < pathSections.length - 1) {
			String root = pathSections[deepth].getNodeName();
			String subPathPrefix = PathUtils.concatPath(pathPrefix, root);
			if (!parsedPaths.contains(subPathPrefix)) {
				parsedPaths.add(subPathPrefix);
				Element childRootNode = DomUtils.getChildByTagName(element,
						root);
				if (childRootNode != null) {
					dispatchChildElementsWithConditionalPath(results,
							parsedPaths, pathSections, deepth + 1,
							subPathPrefix, childRootNode, context);
				}
			}
		} else {
			for (Element childElement : DomUtils.getChildElements(element)) {
				if (!isTagElement(childElement)) {
					Object value = dispatchElement(pathPrefix, childElement,
							context);
					if (value != ConfigUtils.IGNORE_VALUE) {
						results.add(value);
					}
				}
			}
		}
	}

	/**
	 * 将某个XML节点的解析任务分发给匹配的子解析器。
	 * 
	 * @param element
	 *            XML节点
	 * @param context
	 *            解析的上下文对象
	 * @return 解析结果
	 * @throws Exception
	 */
	protected Object dispatchElement(String pathPrefix, Element child,
			ParseContext context) throws Exception {
		String path = PathUtils.concatPath(pathPrefix, child.getNodeName());
		XmlParser parser = subParsers.get(path);
		if (parser != null) {
			return parser.parse(child, context);
		} else {
			if (subParsers.hasConditionalParser) {
				for (Map.Entry<String, ParserInfo> entry : subParsers.subParserInfoMap
						.entrySet()) {
					String subParserPath = entry.getKey();
					ParserInfo parserInfo = entry.getValue();
					Map<String, String> fixedProperties = parserInfo
							.getFixedProperties();

					if (fixedProperties == null
							|| !subParserPath.startsWith(path + '[')) {
						continue;
					}

					boolean according = true;
					for (Map.Entry<String, String> propEntry : fixedProperties
							.entrySet()) {
						if (!ObjectUtils.equals(
								child.getAttribute(propEntry.getKey()),
								propEntry.getValue())) {
							according = false;
							break;
						}
					}

					if (according) {
						parser = parserInfo.getParser();
						return parser.parse(child, context);
					}
				}
			}

			parser = subParsers.get(PathUtils.concatPath(pathPrefix, WILDCARD));
			if (parser != null) {
				return parser.parse(child, context);
			} else {
				return ConfigUtils.IGNORE_VALUE;
			}
		}
	}

	/**
	 * 解析所有的属性，并返回属性值的集合。<br>
	 * 此处所指的属性包括XML节点中的属性(Attribute)以及下列形式的子属性节点：
	 * <code><Property name="xxx">XXXX</Property></code>。
	 * 如果二者同时存在，则将以子属性节点中的定义为准。
	 * 
	 * @param element
	 *            XML节点
	 * @param context
	 *            解析的上下文对象
	 * @return 属性值的集合，其中Map集合的键为属性名，值为相应属性的值。
	 *         注意，此处的属性值可能并不是最终的属性值，它可能是表达式或配置声明对象。
	 * @throws Exception
	 */
	protected Map<String, Object> parseProperties(Element element,
			ParseContext context) throws Exception {
		Map<String, Object> properties = new HashMap<String, Object>();

		for (Element propertyElement : DomUtils.getChildrenByTagName(element,
				XmlConstants.PROPERTY)) {
			String name = propertyElement
					.getAttribute(XmlConstants.ATTRIBUTE_NAME);
			if (StringUtils.isNotEmpty(name)) {
				properties.put(name, propertyElement);
			}
		}

		NamedNodeMap attributes = element.getAttributes();
		int attributeNum = attributes.getLength();
		for (int i = 0; i < attributeNum; i++) {
			Node node = attributes.item(i);
			String property = node.getNodeName();
			properties.put(property, node);
		}

		for (Iterator<Map.Entry<String, Object>> it = properties.entrySet()
				.iterator(); it.hasNext();) {
			Map.Entry<String, Object> entry = it.next();
			String property = entry.getKey();
			Node node = (Node) entry.getValue();
			Object value = parseProperty(property, node, context);
			if (value != ConfigUtils.IGNORE_VALUE) {
				entry.setValue(value);
			} else {
				it.remove();
			}
		}
		return properties;
	}

	/**
	 * 解析给定的属性节点。
	 * 
	 * @param property
	 *            属性名
	 * @param node
	 *            XML节点
	 * @param context
	 *            解析的上下文对象
	 * @return 解析得到的属性值
	 * @throws Exception
	 */
	protected Object parseProperty(String property, Node node,
			ParseContext context) throws Exception {
		Object value;
		XmlParser propertyParser = findPropertyParser(property);
		if (propertyParser != null) {
			value = propertyParser.parse(node, context);
		} else {
			value = ConfigUtils.IGNORE_VALUE;
		}
		return value;
	}

}

class PathSection {
	private String nodeName;
	private Map<String, String> fixedProperties;

	public static PathSection parse(String expression) {
		return new PathSection(expression);
	}

	private PathSection(String expression) {
		if (expression.indexOf('[') > 0) {
			StringBuffer nodeNameBuf = new StringBuffer(), fixedProperty = new StringBuffer(), fixedPropertyValue = new StringBuffer();
			int len = expression.length();
			boolean inBracket = false, beforeEquals = true;
			for (int i = 0; i < len; i++) {
				char c = expression.charAt(i);
				if (!inBracket) {
					if (c == '[') {
						inBracket = true;
					} else {
						nodeNameBuf.append(c);
					}
				} else {
					if (beforeEquals) {
						fixedProperty.append(c);
					} else if (c == '=') {
						beforeEquals = false;
					} else if (c == ';' || c == ',' || c == ']' && i == len - 1) {
						beforeEquals = true;
						if (fixedProperties == null) {
							fixedProperties = new HashMap<String, String>();
						}
						fixedProperties.put(fixedProperty.toString(),
								fixedPropertyValue.toString());
						fixedProperty.setLength(0);
						fixedPropertyValue.setLength(0);
					} else {
						fixedPropertyValue.append(c);
					}
				}
			}
		} else {
			nodeName = expression;
		}
	}

	public String getNodeName() {
		return nodeName;
	}

	public Map<String, String> getFixedProperties() {
		return fixedProperties;
	}
}

class ParserInfo {
	private XmlParser parser;
	private PathSection[] pathSections;
	private Map<String, String> fixedProperties;

	public ParserInfo(XmlParser parser, PathSection[] pathSections) {
		this.parser = parser;
		this.pathSections = pathSections;
		fixedProperties = pathSections[pathSections.length - 1]
				.getFixedProperties();
	}

	public XmlParser getParser() {
		return parser;
	}

	public PathSection[] getPathSections() {
		return pathSections;
	}

	public Map<String, String> getFixedProperties() {
		return fixedProperties;
	}
}

class SubParserMap extends ChildrenMapSupport<String, XmlParser> {
	public boolean cacheBuilded;
	public boolean hasDeepParser;
	public boolean hasConditionalParser;
	public Map<String, ParserInfo> subParserInfoMap = new HashMap<String, ParserInfo>();

	public SubParserMap() {
		super(new LinkedHashMap<String, XmlParser>());
	}

	@Override
	protected void childAdded(String key, XmlParser child) {
		clearCache();
	}

	@Override
	protected void childRemoved(String key, XmlParser child) {
		clearCache();
	}

	private void clearCache() {
		cacheBuilded = false;
		hasDeepParser = false;
		hasConditionalParser = false;
		subParserInfoMap.clear();
	}

	public void buildCache() {
		cacheBuilded = true;

		for (Map.Entry<String, XmlParser> entry : target.entrySet()) {
			String path = entry.getKey();
			String[] ps = StringUtils.split(path,
					DispatchableXmlParser.SUB_PARSER_PATH_SEPERATOR);
			if (ps.length > 1) {
				hasDeepParser = true;
			}
			PathSection[] pathSections = new PathSection[ps.length];
			int i = 0;
			for (String p : ps) {
				PathSection pathSection = PathSection.parse(p);
				if (pathSection.getFixedProperties() != null) {
					if (i < ps.length - 1) {
						throw new IllegalArgumentException(
								"Conditions is only supported in last section ["
										+ path + "].");
					}
					hasConditionalParser = true;
				}
				pathSections[i++] = pathSection;
			}

			subParserInfoMap.put(path, new ParserInfo(entry.getValue(),
					pathSections));
		}
	}

	public ParserInfo getParserInfo(String path) {
		return subParserInfoMap.get(path);
	}
}