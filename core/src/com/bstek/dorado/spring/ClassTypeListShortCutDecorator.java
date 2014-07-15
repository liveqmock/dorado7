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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.MutablePropertyValues;
import org.springframework.beans.factory.config.BeanDefinitionHolder;
import org.springframework.beans.factory.support.AbstractBeanDefinition;
import org.springframework.beans.factory.support.ManagedList;
import org.springframework.beans.factory.xml.BeanDefinitionDecorator;
import org.springframework.beans.factory.xml.ParserContext;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-12-29
 */
public class ClassTypeListShortCutDecorator implements BeanDefinitionDecorator {
	private static final Log logger = LogFactory
			.getLog(ClassTypeListShortCutDecorator.class);
	private static final String IMPL_TYPES = "implTypes";

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public BeanDefinitionHolder decorate(Node node,
			BeanDefinitionHolder definition, ParserContext parserContext) {
		AbstractBeanDefinition beanDef = (AbstractBeanDefinition) definition
				.getBeanDefinition();
		MutablePropertyValues propertyValues = (beanDef.getPropertyValues() == null) ? new MutablePropertyValues()
				: beanDef.getPropertyValues();

		ManagedList list = null;
		boolean firstPropertyValue = propertyValues
				.getPropertyValue(IMPL_TYPES) == null;

		if (!firstPropertyValue) {
			list = (ManagedList) (propertyValues.getPropertyValue(IMPL_TYPES)
					.getValue());
		}
		else {
			list = new ManagedList();
			list.setSource(node);
			list.setMergeEnabled(true);
			propertyValues.addPropertyValue(IMPL_TYPES, list);
			beanDef.setPropertyValues(propertyValues);
		}

		Element el = (Element) node;
		String className = el.getAttribute("name");
		try {
			list.add(Class.forName(className));
		}
		catch (ClassNotFoundException e) {
			logger.warn(e, e);
		}
		return definition;
	}

}
