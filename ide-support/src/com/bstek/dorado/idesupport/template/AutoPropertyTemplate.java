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

package com.bstek.dorado.idesupport.template;

import java.lang.reflect.Method;

import com.bstek.dorado.annotation.XmlProperty;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-11-24
 */
public class AutoPropertyTemplate extends PropertyTemplate {
	private Method method;
	private XmlProperty xmlProperty;
	private boolean isPrimitive;

	public AutoPropertyTemplate(String name) {
		super(name);
	}

	public AutoPropertyTemplate(String name, XmlProperty xmlProperty) {
		super(name);
		this.xmlProperty = xmlProperty;
	}

	public AutoPropertyTemplate(String name, Method method,
			XmlProperty xmlProperty) {
		super(name);
		this.method = method;
		this.xmlProperty = xmlProperty;
	}

	public XmlProperty getXmlProperty() {
		return xmlProperty;
	}

	public Method getMethod() {
		return method;
	}

	public boolean isPrimitive() {
		return isPrimitive;
	}

	public void setPrimitive(boolean isPrimitive) {
		this.isPrimitive = isPrimitive;
	}
}
