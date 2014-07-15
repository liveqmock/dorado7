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

package com.bstek.dorado.view.widget;

import java.util.Map;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.view.annotation.Widget;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-6-19
 */
@Widget(name = "SubViewHolder", category = "General", dependsPackage = "widget")
@ClientObject(prototype = "dorado.widget.SubViewHolder", shortTypeName = "SubViewHolder")
@XmlNode(clientTypes = { ClientType.DESKTOP, ClientType.TOUCH })
public class SubViewHolder extends Control implements HtmlElement {
	private String subView;
	private Map<String, Object> context;

	@ClientProperty(outputter = "spring:dorado.subViewPropertyOutputter")
	public String getSubView() {
		return subView;
	}

	public void setSubView(String subView) {
		this.subView = subView;
	}

	@XmlProperty(composite = true)
	public Map<String, Object> getContext() {
		return context;
	}

	public void setContext(Map<String, Object> context) {
		this.context = context;
	}
}
