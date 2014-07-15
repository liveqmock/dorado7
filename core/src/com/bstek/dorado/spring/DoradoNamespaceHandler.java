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

import org.springframework.beans.factory.xml.NamespaceHandlerSupport;

/**
 * @author Frank.Zhang (mailto:frank.zhang@bstek.com), Benny Bao
 *         (mailto:benny.bao@bstek.com)
 * @since Jun 25, 2009
 */
public class DoradoNamespaceHandler extends NamespaceHandlerSupport {

	public void init() {
		registerBeanDefinitionDecorator("property-parser",
				new MapEntryShortCutDecorator("propertyParsers"));
		registerBeanDefinitionDecorator("sub-parser",
				new MapEntryShortCutDecorator("subParsers"));
		registerBeanDefinitionDecorator("attribute-parser",
				new MapEntryShortCutDecorator("attributeParsers"));
		registerBeanDefinitionDecorator("property-outputter",
				new MapEntryShortCutDecorator("propertieConfigs"));
		registerBeanDefinitionDecorator("virtual-property",
				new VirtualPropertyDecorator());
		registerBeanDefinitionDecorator("virtual-event",
				new VirtualEventDecorator());

		registerBeanDefinitionParser("import-dorado",
				new ImportDoradoElementParser());
	}

}
