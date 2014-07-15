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

package com.bstek.dorado.spring;

import java.util.Properties;

import org.springframework.beans.MutablePropertyValues;
import org.springframework.beans.factory.config.BeanDefinitionHolder;
import org.springframework.beans.factory.support.AbstractBeanDefinition;
import org.springframework.beans.factory.support.ManagedMap;
import org.springframework.beans.factory.xml.BeanDefinitionDecorator;
import org.springframework.beans.factory.xml.ParserContext;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-7-6
 */
public class VirtualPropertyDecorator implements BeanDefinitionDecorator {

	private static final String VIRTUAL_PROPERTIES = "virtualProperties";

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public BeanDefinitionHolder decorate(Node node,
			BeanDefinitionHolder definition, ParserContext parserContext) {
		AbstractBeanDefinition beanDef = (AbstractBeanDefinition) definition
				.getBeanDefinition();
		MutablePropertyValues propertyValues = (beanDef.getPropertyValues() == null) ? new MutablePropertyValues()
				: beanDef.getPropertyValues();

		ManagedMap map = null;
		boolean firstPropertyValue = propertyValues
				.getPropertyValue(VIRTUAL_PROPERTIES) == null;

		if (!firstPropertyValue) {
			map = (ManagedMap) (propertyValues
					.getPropertyValue(VIRTUAL_PROPERTIES).getValue());
		} else {
			map = new ManagedMap();
			map.setSource(node);
			map.setMergeEnabled(true);
			propertyValues.addPropertyValue(VIRTUAL_PROPERTIES, map);
			beanDef.setPropertyValues(propertyValues);
		}

		Element el = (Element) node;
		String name = el.getAttribute("name");
		Properties propertyDescriptor = new Properties();
		propertyDescriptor.setProperty("type", el.getAttribute("type"));
		propertyDescriptor.setProperty("avialableAt",
				el.getAttribute("avialableAt"));
		propertyDescriptor.setProperty("defaultValue",
				el.getAttribute("defaultValue"));
		propertyDescriptor.setProperty("referenceComponentType",
				el.getAttribute("referenceComponentType"));
		map.put(name, propertyDescriptor);
		return definition;
	}

}
