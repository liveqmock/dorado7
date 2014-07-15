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

package com.bstek.dorado.view.widget.form;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.datacontrol.AbstractDataControl;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2013-6-19
 */
@Widget(name = "TemplateField", category = "Form", dependsPackage = "base-widget")
@ClientObject(prototype = "dorado.widget.TemplateField", shortTypeName = "TemplateField")
@XmlNode(clientTypes = { ClientType.DESKTOP, ClientType.TOUCH })
public class TemplateField extends AbstractDataControl {
	private String template;

	@IdeProperty(highlight = 1, editor = "multiLines")
	public String getTemplate() {
		return template;
	}

	public void setTemplate(String template) {
		this.template = template;
	}

}
