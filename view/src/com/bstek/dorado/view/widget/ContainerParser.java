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

package com.bstek.dorado.view.widget;

import java.util.Map;

import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.xml.XmlParser;
import com.bstek.dorado.view.config.definition.ContainerDefinition;
import com.bstek.dorado.view.config.definition.LayoutDefinition;
import com.bstek.dorado.view.config.xml.ViewParseContext;
import com.bstek.dorado.view.config.xml.ViewParseContext.LayoutInfo;
import com.bstek.dorado.view.config.xml.ViewXmlConstants;
import com.bstek.dorado.view.registry.LayoutTypeRegisterInfo;
import com.bstek.dorado.view.registry.LayoutTypeRegistry;

/**
 * 容器组件的解析器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 27, 2008
 */
public class ContainerParser extends ControlParser {
	private XmlParser layoutParser;
	private LayoutTypeRegistry layoutTypeRegistry;

	/**
	 * 设置布局管理器的解析器。
	 */
	public void setLayoutParser(XmlParser layoutParser) {
		this.layoutParser = layoutParser;
	}

	/**
	 * 设置布局管理器类型的注册管理器。
	 */
	public void setLayoutTypeRegistry(LayoutTypeRegistry layoutTypeRegistry) {
		this.layoutTypeRegistry = layoutTypeRegistry;
	}

	@Override
	protected Object internalParse(Node node, ParseContext context)
			throws Exception {
		Element element = (Element) node;
		ViewParseContext viewContext = (ViewParseContext) context;

		LayoutDefinition layout = null;
		Node layoutNode = element
				.getAttributeNode(ViewXmlConstants.ATTRIBUTE_LAYOUT);
		if (layoutNode != null) {
			layout = (LayoutDefinition) layoutParser.parse(layoutNode, context);
		}

		LayoutTypeRegisterInfo layoutTypeInfo = null;
		if (layout != null) {
			layoutTypeInfo = layoutTypeRegistry.getRegisterInfo(layout
					.getType());
		}
		viewContext.setCurrentLayout(new ViewParseContext.LayoutInfo(element,
				layoutTypeInfo));

		ContainerDefinition containerDefinition = (ContainerDefinition) super
				.internalParse(node, context);
		if (layout != null) {
			containerDefinition.setLayout(layout);
		}

		viewContext.restoreCurrentLayout();
		return containerDefinition;
	}

	@Override
	protected Map<String, Object> parseProperties(Element element,
			ParseContext context) throws Exception {
		ViewParseContext viewContext = (ViewParseContext) context;
		LayoutInfo layoutInfo = viewContext.getCurrentLayout();
		boolean restored = (layoutInfo != null && layoutInfo
				.getContainerElement() == element);
		if (restored) {
			viewContext.restoreCurrentLayout();
		}
		try {
			return super.parseProperties(element, context);
		} finally {
			if (restored) {
				viewContext.setCurrentLayout(layoutInfo);
			}
		}
	}
}
