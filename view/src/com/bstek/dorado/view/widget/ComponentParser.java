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

import java.lang.reflect.Constructor;

import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.definition.ObjectDefinition;
import com.bstek.dorado.core.el.Expression;
import com.bstek.dorado.data.config.xml.GenericObjectParser;
import com.bstek.dorado.view.config.definition.ComponentDefinition;
import com.bstek.dorado.view.config.definition.ViewDefinition;
import com.bstek.dorado.view.config.xml.ViewParseContext;
import com.bstek.dorado.view.config.xml.ViewXmlConstants;
import com.bstek.dorado.view.registry.ComponentTypeRegisterInfo;

/**
 * Component解析器的抽象支持类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jan 19, 2008
 */
public class ComponentParser extends GenericObjectParser implements Cloneable {
	private static final Class<?>[] PARAMETER_TYPES = new Class[] { ComponentTypeRegisterInfo.class };

	private String componentType;
	private ComponentDefinition assembledComponentDefinition;

	public String getComponentType() {
		return componentType;
	}

	public void setComponentType(String componentType) {
		this.componentType = componentType;
	}

	public ComponentDefinition getAssembledComponentDefinition() {
		return assembledComponentDefinition;
	}

	public void setAssembledComponentDefinition(
			ComponentDefinition assembledComponentDefinition) {
		this.assembledComponentDefinition = assembledComponentDefinition;
	}

	@Override
	protected void initDefinition(ObjectDefinition definition, Element element,
			ParseContext context) throws Exception {
		ComponentDefinition component = (ComponentDefinition) definition;

		String id = element.getAttribute(ViewXmlConstants.ATTRIBUTE_ID);
		Expression expression = getExpressionHandler().compile(id);
		if (expression != null) {
			component.setProperty("id", expression);
		} else {
			component.setId(id);
		}

		component.setComponentType(componentType);
		component.setAssembleComponentDefinition(assembledComponentDefinition);

		super.initDefinition(definition, element, context);
	}

	@Override
	protected Object internalParse(Node node, ParseContext context)
			throws Exception {
		ComponentDefinition component = (ComponentDefinition) super
				.internalParse(node, context);
		registerComponent(component, (ViewParseContext) context);
		return component;
	}

	/**
	 * 将当前得到的组件配置声明对象注册到相应的视图配置中。
	 * 
	 * @param component
	 *            组件配置声明对象
	 * @param context
	 *            解析上下文
	 */
	protected void registerComponent(ComponentDefinition component,
			ViewParseContext context) {
		ViewDefinition viewDefinition = context.getViewConfigDefinition()
				.getViewDefinition();
		viewDefinition.registerComponent(component);
	}

	@Override
	protected ObjectDefinition createDefinition(Element element,
			ParseContext context) throws Exception {
		Constructor<? extends ObjectDefinition> constructor = getDefinitionType()
				.getConstructor(PARAMETER_TYPES);
		return constructor
				.newInstance(new Object[] { ((ViewParseContext) context)
						.getCurrentComponentTypeRegisterInfo() });
	}
}
