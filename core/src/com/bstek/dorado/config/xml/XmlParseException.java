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

import org.apache.commons.lang.StringEscapeUtils;
import org.apache.commons.lang.StringUtils;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.core.io.Resource;

/**
 * XML解析异常。
 * <p>
 * 用于封装XML解析过程中产生的异常信息的异常对象。
 * </p>
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 17, 2007
 */
public class XmlParseException extends IllegalArgumentException {
	private static final long serialVersionUID = 5085933510960299967L;

	/**
	 * @param message 异常信息
	 */
	public XmlParseException(String message) {
		super(populateErrorMessage(message, null, null));
	}

	/**
	 * @param message 异常信息
	 * @param context 解析上下文
	 */
	public XmlParseException(String message, ParseContext context) {
		super(populateErrorMessage(message, null, (context != null) ? context
				.getResource() : null));
	}

	/**
	 * @param message 异常信息
	 * @param node 相关的XML节点
	 * @param resource 相关的资源描述对象
	 */
	public XmlParseException(String message, Node node, Resource resource) {
		super(populateErrorMessage(message, node, resource));
	}

	/**
	 * @param message 异常信息
	 * @param node 相关的XML节点
	 * @param context 解析上下文
	 */
	public XmlParseException(String message, Node node, ParseContext context) {
		super(populateErrorMessage(message, node, (context != null) ? context
				.getResource() : null));
	}

	private static String populateErrorMessage(String message, Node node,
			Resource resource) {
		StringBuffer sb = new StringBuffer();
		if (message != null) sb.append(message);

		if (resource != null) {
			sb.append(" - ").append(resource);
		}

		if (node != null) {
			Element element;
			if (node instanceof Element) {
				element = (Element) node;
			}
			else {
				element = (Element) node.getParentNode();
			}

			if (element != null) {
				sb.append(" - ").append("<" + element.getTagName() + " ");
				NamedNodeMap names = element.getAttributes();
				for (int i = 0; i < 3 && i < names.getLength(); i++) {
					sb.append(
							populateXmlAttribute(element, names.item(i)
									.getNodeName())).append(" ");
				}
				sb.append("... ");
			}
		}
		return sb.toString();
	}

	private static String populateXmlAttribute(Element element, String attribute) {
		String value = element.getAttribute(attribute);
		if (StringUtils.isNotEmpty(value)) {
			return attribute + "=\"" + StringEscapeUtils.escapeXml(value)
					+ "\"";
		}
		else {
			return "";
		}
	}
}
