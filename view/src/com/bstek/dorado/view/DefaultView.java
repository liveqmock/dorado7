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

package com.bstek.dorado.view;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.manager.ViewConfig;

/**
 * 视图对象。
 * <p>
 * 视图对象对象用于定义和管理视图中的各种对象。
 * </p>
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jan 18, 2008
 */
@Widget(name = "View", category = "General", dependsPackage = "base-widget")
@XmlNode(nodeName = "View", label = "View")
@ClientObject(usePrototype = true, prototype = "dorado.widget.View", shortTypeName = "View", outputter = "spring:dorado.viewOutputter", properties = @ClientProperty(propertyName = "context", outputter = "com.bstek.dorado.view.ViewContextPropertyOutputter"))
public class DefaultView extends View {
	public DefaultView(ViewConfig viewConfig) {
		super(viewConfig);
	}
}
