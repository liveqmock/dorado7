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

package com.bstek.dorado.util.xml;

import java.util.ArrayList;
import java.util.List;

import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 * 用于辅助DOM对象处理的工具类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 14, 2007
 * @see org.w3c.dom.Document
 * @see org.w3c.dom.Node
 * @see org.w3c.dom.Element
 */
public abstract class DomUtils {
	private DomUtils() {
	}

	/**
	 * 返回某个XML节点的文本内容。<br>
	 * 例如：<node>ABC</node>的文本内容是ABC。
	 * 
	 * @param element
	 *            XML节点。
	 * @return 节点的文本内容。
	 */
	public static String getTextContent(Element element) {
		return org.springframework.util.xml.DomUtils.getTextValue(element);
	}

	/**
	 * 查找某个特定名称的子节点，如果找到了就返回该节点的文本内容。
	 * 
	 * @param elemenet
	 *            父节点。
	 * @param childElemenetName
	 *            子节点的名称。
	 * @return 子节点的文本内容。
	 */
	public static String getChildTextContent(Element elemenet,
			String childElemenetName) {
		return org.springframework.util.xml.DomUtils
				.getChildElementValueByTagName(elemenet, childElemenetName);
	}

	/**
	 * 判断某个节点的名称是否与给定的字符串相同。
	 * 
	 * @param node
	 *            节点。
	 * @param desiredName
	 *            用于判断的字符串。
	 * @return 是否相同。
	 */
	public static boolean isNodeNameEquals(Node node, String desiredName) {
		return org.springframework.util.xml.DomUtils.nodeNameEquals(node,
				desiredName);
	}

	/**
	 * 返回第一个名称与给定字符创匹配的子节点，如果没有找到则返回null。
	 * 
	 * @param element
	 *            父节点。
	 * @param childElementName
	 *            寻找的子节点名称。
	 * @return 得到的子节点。
	 */
	public static Element getChildByTagName(Element element,
			String childElementName) {
		return org.springframework.util.xml.DomUtils.getChildElementByTagName(
				element, childElementName);
	}

	/**
	 * 根据给定的名称返回所有匹配节点的集合。
	 * 
	 * @param element
	 *            父节点。
	 * @param childElementName
	 *            寻找的子节点名称。
	 * @return 得到的子节点的集合，如果没有找到任何匹配的节点将返回空的集合对象。
	 */
	public static List<Element> getChildrenByTagName(Element element,
			String childElementName) {
		return org.springframework.util.xml.DomUtils.getChildElementsByTagName(
				element, childElementName);
	}

	/**
	 * 根据返回给定节点的所有子节点的集合。
	 * 
	 * @param element
	 *            父节点。
	 * @return 子节点的集合。
	 */
	public static List<Element> getChildElements(Element element) {
		List<Element> list = new ArrayList<Element>();
		NodeList nodeList = element.getChildNodes();
		int size = nodeList.getLength();
		for (int i = 0; i < size; i++) {
			Node childNode = nodeList.item(i);
			if (childNode instanceof Element) {
				list.add((Element) childNode);
			}
		}
		return list;
	}

	/**
	 * 根据返回给定节点的第一个子节点。
	 * 
	 * @param element
	 *            父节点。
	 * @return 第一个子节点。
	 */
	public static Element getFirstChildElement(Element element) {
		Node childNode = element.getFirstChild();
		while (childNode != null) {
			if (childNode instanceof Element) {
				return (Element) childNode;
			}
			childNode = childNode.getNextSibling();
		}
		return null;
	}

}
