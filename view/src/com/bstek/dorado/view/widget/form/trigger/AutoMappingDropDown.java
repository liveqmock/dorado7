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

package com.bstek.dorado.view.widget.form.trigger;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.view.annotation.Widget;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-8-10
 */
@Widget(name = "AutoMappingDropDown", category = "Trigger",
		dependsPackage = "base-widget-desktop", autoGenerateId = true)
@ClientObject(prototype = "dorado.widget.AutoMappingDropDown",
		shortTypeName = "AutoMappingDropDown")
@XmlNode(clientTypes = ClientType.DESKTOP)
public class AutoMappingDropDown extends RowListDropDown {
	private String property = "value";

	public AutoMappingDropDown() {
		setDynaFilter(true);
	}

	@Override
	@ClientProperty(escapeValue = "true")
	public boolean isDynaFilter() {
		return super.isDynaFilter();
	}

	@Override
	@ClientProperty(escapeValue = "value")
	public String getProperty() {
		return property;
	}

	@Override
	public void setProperty(String property) {
		this.property = property;
	}
}
