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
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.xml.BeanDefinitionParser;
import org.springframework.beans.factory.xml.ParserContext;
import org.springframework.util.ClassUtils;
import org.w3c.dom.Element;

public class ImportDoradoElementParser implements BeanDefinitionParser {
	private static final Log logger = LogFactory
			.getLog(ImportDoradoElementParser.class);

	private static final String DEFAULT_IMPORTER = "com.bstek.dorado.web.servlet.DefaultDoradoAppContextImporter";

	public BeanDefinition parse(Element element, ParserContext parserContext) {
		try {
			@SuppressWarnings("unchecked")
			Class<DoradoAppContextImporter> cl = (Class<DoradoAppContextImporter>) ClassUtils
					.forName(DEFAULT_IMPORTER, getClass().getClassLoader());
			DoradoAppContextImporter importer = cl.newInstance();
			importer.importDoradoAppContext(element, parserContext);
		}
		catch (Exception e) {
			logger.error(e, e);
		}
		return null;
	}

}
