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

package com.bstek.dorado.view.config.xml;

import java.util.List;

import org.w3c.dom.Element;

import com.bstek.dorado.config.xml.XmlConstants;
import com.bstek.dorado.config.xml.XmlParseException;
import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.util.xml.DomUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-7-11
 */
public final class ViewConfigParserUtils {
	private ViewConfigParserUtils() {
	}

	public static Element findArgumentsElement(Element documentElement,
			Resource resource) throws Exception {
		List<Element> elements = DomUtils.getChildrenByTagName(documentElement,
				ViewXmlConstants.ARGUMENTS);
		int size = elements.size();
		if (size > 1) {
			throw new XmlParseException("More than one <"
					+ ViewXmlConstants.ARGUMENTS + "> found.", documentElement,
					resource);
		} else if (size == 1) {
			return elements.get(0);
		} else {
			return null;
		}
	}

	public static Element findContextElement(Element documentElement,
			Resource resource) throws Exception {
		List<Element> elements = DomUtils.getChildrenByTagName(documentElement,
				ViewXmlConstants.CONTEXT);
		int size = elements.size();
		if (size > 1) {
			throw new XmlParseException("More than one <"
					+ ViewXmlConstants.CONTEXT + "> found.", documentElement,
					resource);
		} else if (size == 1) {
			return elements.get(0);
		} else {
			return null;
		}
	}

	public static Element findModelElement(Element documentElement,
			Resource resource) throws Exception {
		List<Element> elements = DomUtils.getChildrenByTagName(documentElement,
				ViewXmlConstants.MODEL);
		int size = elements.size();
		if (size > 1) {
			throw new XmlParseException("More than one <"
					+ ViewXmlConstants.MODEL + "> found.", documentElement,
					resource);
		} else if (size == 1) {
			return elements.get(0);
		} else {
			return null;
		}
	}

	public static Element findViewElement(Element element, Resource resource) {
		Element viewElement = null;
		for (Element childElement : DomUtils.getChildElements(element)) {
			String nodeName = childElement.getNodeName();
			if (!nodeName.equals(XmlConstants.PROPERTY)
					&& !nodeName.equals(ViewXmlConstants.ARGUMENTS)
					&& !nodeName.equals(ViewXmlConstants.MODEL)
					&& !nodeName.equals(ViewXmlConstants.CONTEXT)) {
				if (viewElement != null) {
					throw new XmlParseException(
							"More than one view element found.", element,
							resource);
				}
				viewElement = childElement;
			}
		}
		if (viewElement == null) {
			throw new XmlParseException("No view element found.", element,
					resource);
		}
		return viewElement;
	}
}
