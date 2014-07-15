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

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.MutablePropertyValues;
import org.springframework.beans.factory.config.BeanDefinitionHolder;
import org.springframework.beans.factory.config.RuntimeBeanReference;
import org.springframework.beans.factory.support.AbstractBeanDefinition;
import org.springframework.beans.factory.support.ManagedMap;
import org.springframework.beans.factory.xml.BeanDefinitionDecorator;
import org.springframework.beans.factory.xml.ParserContext;
import org.springframework.util.xml.DomUtils;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

/**
 * @author Frank.Zhang (mailto:frank.zhang@bstek.com), Benny Bao
 *         (mailto:benny.bao@bstek.com)
 * @since Jun 25, 2009
 */
public class MapEntryShortCutDecorator implements BeanDefinitionDecorator {
	private static final char KEY_DELIM = ',';

	private String property;
	private boolean supportsMultiKey = true;

	public MapEntryShortCutDecorator(String property) {
		this.property = property;
	}

	public MapEntryShortCutDecorator(String property, boolean supportsMultiKey) {
		this.property = property;
		this.supportsMultiKey = supportsMultiKey;
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public BeanDefinitionHolder decorate(Node node,
			BeanDefinitionHolder definition, ParserContext parserContext) {
		AbstractBeanDefinition beanDef = (AbstractBeanDefinition) definition
				.getBeanDefinition();
		MutablePropertyValues propertyValues = (beanDef.getPropertyValues() == null) ? new MutablePropertyValues()
				: beanDef.getPropertyValues();

		ManagedMap map = null;
		boolean firstPropertyValue = propertyValues.getPropertyValue(property) == null;

		if (!firstPropertyValue) {
			map = (ManagedMap) (propertyValues.getPropertyValue(property)
					.getValue());
		}
		else {
			map = new ManagedMap();
			map.setSource(node);
			map.setMergeEnabled(true);
			propertyValues.addPropertyValue(property, map);
			beanDef.setPropertyValues(propertyValues);
		}

		Element el = (Element) node;
		String key = el.getAttribute("key");
		String value = el.getAttribute("value");
		String valueRef = el.getAttribute("value-ref");

		Object entryValue = null;
		if (StringUtils.isNotEmpty(value)) {
			entryValue = value;
		}
		else if (StringUtils.isNotEmpty(valueRef)) {
			RuntimeBeanReference ref = new RuntimeBeanReference(valueRef);
			ref.setSource(parserContext.getReaderContext().extractSource(el));
			entryValue = ref;
		}
		else {
			Element beanEl = DomUtils.getChildElementByTagName(el, "bean");
			if (beanEl != null) {
				entryValue = parserContext.getDelegate()
						.parseBeanDefinitionElement(beanEl);
			}
		}

		if (supportsMultiKey && StringUtils.isNotEmpty(key)) {
			for (String k : StringUtils.split(key, KEY_DELIM)) {
				map.put(k, entryValue);
			}
		}
		else {
			map.put(key, entryValue);
		}
		return definition;
	}

}
