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

import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.xml.XmlParseException;
import com.bstek.dorado.config.xml.XmlParser;
import com.bstek.dorado.config.xml.XmlParserHelper;
import com.bstek.dorado.util.CloneUtils;
import com.bstek.dorado.view.config.definition.ComponentDefinition;
import com.bstek.dorado.view.registry.AssembledComponentTypeRegisterInfo;
import com.bstek.dorado.view.registry.ComponentTypeRegisterInfo;
import com.bstek.dorado.view.registry.ComponentTypeRegistry;
import com.bstek.dorado.view.widget.Component;
import com.bstek.dorado.view.widget.ComponentParser;

/**
 * Component解析任务的分配器。
 * <p>
 * 其作用是根据节点的属性将各种Component的解析任务分派给相应的子解析器。
 * </p>
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jan 22, 2008
 */
public class ComponentParserDispatcher implements XmlParser {
	private XmlParserHelper xmlParserHelper;
	private ComponentTypeRegistry componentTypeRegistry;

	public void setXmlParserHelper(
			XmlParserHelper xmlParserHelper) {
		this.xmlParserHelper = xmlParserHelper;
	}

	/**
	 * 设置组件类型的注册管理器。
	 */
	public void setComponentTypeRegistry(
			ComponentTypeRegistry componentTypeRegistry) {
		this.componentTypeRegistry = componentTypeRegistry;
	}

	public Object parse(Node node, ParseContext context) throws Exception {
		ViewParseContext viewContext = (ViewParseContext) context;
		ComponentParser componentParser = null;
		Element element = (Element) node;

		String type = element.getTagName();
		ComponentTypeRegisterInfo registerInfo = componentTypeRegistry
				.getRegisterInfo(type);
		if (registerInfo != null) {
			Class<? extends Component> classType = registerInfo.getClassType();
			componentParser = (ComponentParser) xmlParserHelper
					.getXmlParser(classType);

			if (registerInfo instanceof AssembledComponentTypeRegisterInfo) {
				ComponentDefinition superComponentDefinition = ((AssembledComponentTypeRegisterInfo) registerInfo)
						.getSuperComponentDefinition();
				componentParser = CloneUtils.clone(componentParser);
				componentParser
						.setAssembledComponentDefinition(superComponentDefinition);
			}
		} else {
			throw new XmlParseException("Unrecognized Component type [" + type
					+ "].", element, context);
		}

		if (componentParser == null) {
			throw new XmlParseException(
					"Can not get Parser for DataProvider of [" + type
							+ "] type.", element, context);
		}

		ComponentTypeRegisterInfo originRegisterInfo = viewContext
				.getCurrentComponentTypeRegisterInfo();
		viewContext.setCurrentComponentTypeRegisterInfo(registerInfo);
		try {
			return componentParser.parse(element, context);
		} finally {
			viewContext.setCurrentComponentTypeRegisterInfo(originRegisterInfo);
		}
	}
}
