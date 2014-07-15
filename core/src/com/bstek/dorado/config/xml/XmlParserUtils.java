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

import java.util.List;

import org.w3c.dom.Attr;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.bstek.dorado.util.xml.DomUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-9-3
 */
public abstract class XmlParserUtils {

	/**
	 * 判断某属性节点是否是一个只定义了简单属性值的节点。不考虑表达式可能返回的复杂类型数据。
	 * @param node
	 * @return
	 */
	public static boolean isSimpleValueProperty(Node node) {
		if (node instanceof Attr) {
			return true;
		}
		else {
			Element element = (Element) node;
			NodeList childNodes = element.getChildNodes();
			int len = (childNodes != null) ? childNodes.getLength() : 0;
			if (len == 0) return true;
			else if (len == 1) {
				return (childNodes.item(0) instanceof Text);
			}
			else {
				return false;
			}
		}
	}

	/**
	 * 返回属性节点中的简单类型的值。如果节点中定义的是复杂类型数据则返回null。
	 * @param node
	 * @return
	 */
	public static String getSimpleValue(Node node) {
		if (node instanceof Attr) {
			return node.getNodeValue();
		}
		else {
			Element element = (Element) node;
			int len = element.getChildNodes().getLength();
			if (len == 0) return element.getAttribute(XmlConstants.VALUE);
			else if (len == 1) {
				return element.getFirstChild().getNodeValue();
			}
		}
		return null;
	}

	/**
	 * 根据某属性名返回一个有效的、包含了具体的配置信息的子节点(Element)或属性(Attribute)。<br>
	 * 此方法将按下面的顺序来查找配置信息：
	 * <ul>
	 * <li>查找名为childElementName的子节点，如果找到则返回。</li>
	 * <li>查找其name属性为propertyName的子Property节点，如果找到则返回。</li>
	 * <li>查找其name属性为propertyName的属性节点，如果找到则返回。</li>
	 * </ul>
	 * @param element 当前节点。
	 * @param propertyName 属性名。
	 * @return 子节点(Element)或属性(Attribute)。
	 */
	public static Node getPropertyNode(Element element, String propertyName) {
		return getPropertyNode(element, propertyName, null);
	}

	/**
	 * 根据某属性名返回一个有效的、包含了具体的配置信息的子节点(Element)或属性(Attribute)。<br>
	 * 此方法将按下面的顺序来查找配置信息：
	 * <ul>
	 * <li>查找名为childElementName的子节点，如果找到则返回。</li>
	 * <li>查找其name属性为propertyName的子Property节点，如果找到则返回。</li>
	 * <li>查找其name属性为propertyName的属性节点，如果找到则返回。</li>
	 * </ul>
	 * @param element 当前节点。
	 * @param propertyName 属性名。
	 * @param childElementName 子属性名。可为null，表忽略。
	 * @return 子节点(Element)或属性(Attribute)。
	 */
	public static Node getPropertyNode(Element element, String propertyName,
			String childElementName) {
		Node propertyNode = null;

		boolean skipPropertyElement = false;
		List<Element> children = DomUtils.getChildElements(element);
		for (Element child : children) {
			String nodeName = child.getNodeName();
			if (!skipPropertyElement && XmlConstants.PROPERTY.equals(nodeName)) {
				if (propertyName.equals(child
						.getAttribute(XmlConstants.ATTRIBUTE_NAME))) {
					propertyNode = child;
					skipPropertyElement = (childElementName != null);
				}
			}
			else if (childElementName != null) {
				if (childElementName.equals(nodeName)) {
					propertyNode = child;
					break;
				}
			}
		}

		if (propertyNode == null) {
			propertyNode = element.getAttributeNode(propertyName);
		}
		return propertyNode;
	}
}
