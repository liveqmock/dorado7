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

package com.bstek.dorado.data.config.definition;

import com.bstek.dorado.data.type.property.BasePropertyDef;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-4-13
 */
public class PropertyDefDefinition extends GenericObjectDefinition {
	public PropertyDefDefinition() {
		setImplType(BasePropertyDef.class);
	}

	public PropertyDefDefinition(String name) {
		setName(name);
	}

	public String getName() {
		return (String) getProperty("name");
	}

	public void setName(String name) {
		setProperty("name", name);
	}
}
