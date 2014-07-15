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

import org.w3c.dom.Node;

import com.bstek.dorado.config.ConfigUtils;
import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.util.clazz.ClassUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-11-19
 */
public class ClassTypePropertyParser extends StaticPropertyParser {

	private boolean failSafe;

	public void setFailSafe(boolean failSafe) {
		this.failSafe = failSafe;
	}

	@Override
	protected Object doParse(Node node, ParseContext context) throws Exception {
		Object value = super.doParse(node, context);
		if (value == null)
			return null;

		if (value instanceof String) {
			try {
				return ClassUtils.forName((String) value);
			} catch (ClassNotFoundException e) {
				if (failSafe) {
					return ConfigUtils.IGNORE_VALUE;
				} else {
					throw e;
				}
			}
		} else if (value instanceof Class<?>) {
			return value;
		} else {
			throw new XmlParseException("Class type expected.", node, context);
		}
	}
}
