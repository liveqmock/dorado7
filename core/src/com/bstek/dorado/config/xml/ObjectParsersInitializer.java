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

package com.bstek.dorado.config.xml;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;

import com.bstek.dorado.core.EngineStartupListener;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-11-23
 */
public class ObjectParsersInitializer extends EngineStartupListener implements
		BeanPostProcessor {
	private static Log logger = LogFactory
			.getLog(ObjectParsersInitializer.class);

	private XmlParserHelper xmlParserHelper;
	private List<ObjectParser> parsers = new ArrayList<ObjectParser>();

	public void setXmlParserHelper(
			XmlParserHelper xmlParserHelper) {
		this.xmlParserHelper = xmlParserHelper;
	}

	public Object postProcessBeforeInitialization(Object bean, String beanName)
			throws BeansException {
		return bean;
	}

	public Object postProcessAfterInitialization(Object bean, String beanName)
			throws BeansException {
		if (bean instanceof ObjectParser) {
			parsers.add((ObjectParser) bean);
		}
		return bean;
	}

	@Override
	public int getOrder() {
		return 0;
	}

	@Override
	public void onStartup() throws Exception {
		try {
			for (ObjectParser parser : parsers.toArray(new ObjectParser[0])) {
				xmlParserHelper.initObjectParser(parser);
			}
			parsers.clear();
		} catch (Exception e) {
			logger.error(e, e);
		}
	}
}
