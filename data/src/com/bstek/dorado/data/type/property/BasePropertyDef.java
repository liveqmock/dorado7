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

package com.bstek.dorado.data.type.property;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.XmlNode;

/**
 * 基本属性。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apirl 17, 2007
 */
@XmlNode(nodeName = "PropertyDef", label = "PropertyDef", parser = "spring:dorado.propertyDefParser", definitionType = "com.bstek.dorado.data.config.definition.PropertyDefDefinition")
@ClientObject(prototype = "dorado.BasePropertyDef", shortTypeName = "Default")
public class BasePropertyDef extends PropertyDefSupport {
	private String propertyPath;

	public BasePropertyDef() {
	}

	public BasePropertyDef(String name) {
		setName(name);
	}

	@ClientProperty(ignored = true)
	public String getPropertyPath() {
		return propertyPath;
	}

	public void setPropertyPath(String propertyPath) {
		this.propertyPath = propertyPath;
	}
}
