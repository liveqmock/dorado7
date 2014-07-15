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

package com.bstek.dorado.web.resolver;

import java.util.List;

import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.xml.XmlParser;
import com.bstek.dorado.util.Assert;
import com.bstek.dorado.util.xml.DomUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-1-23
 */
public class ResourceTypeParser implements XmlParser {

	public static class ResourceTypeParseContext extends ParseContext {
		public ResourceTypeManager resourceTypeManager;

		public ResourceTypeManager getResourceTypeManager() {
			return resourceTypeManager;
		}

		public void setResourceTypeManager(
				ResourceTypeManager resourceTypeManager) {
			this.resourceTypeManager = resourceTypeManager;
		}
	}

	public Object parse(Node node, ParseContext context) throws Exception {
		List<Element> typeElements = DomUtils.getChildrenByTagName(
				(Element) node, "resource-type");
		for (Element typeElement : typeElements) {
			parseTypeElement(typeElement, context);
		}
		return null;
	}

	private void parseTypeElement(Element typeElement, ParseContext context)
			throws Exception {
		String type = typeElement.getAttribute("type");
		Assert.notEmpty(type);
		String contentType = typeElement.getAttribute("content-type");
		boolean compressible = Boolean.parseBoolean(typeElement
				.getAttribute("compressible"));

		ResourceTypeManager resourceTypeManager = ((ResourceTypeParseContext) context)
				.getResourceTypeManager();
		resourceTypeManager.registerResourceType(new ResourceType(type,
				contentType, compressible));
	}
}
