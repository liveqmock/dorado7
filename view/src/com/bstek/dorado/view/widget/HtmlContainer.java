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

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.view.annotation.Widget;

/**
 * 可完全通过HTML/DHTML自定义渲染方式的容器控件。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Sep 30, 2008
 */
@Widget(name = "HtmlContainer", category = "General", dependsPackage = "widget")
@ClientObject(prototype = "dorado.widget.HtmlContainer", shortTypeName = "HtmlContainer", outputter = "spring:dorado.htmlContainerOutputter")
@XmlNode(clientTypes = { ClientType.DESKTOP, ClientType.TOUCH })
public class HtmlContainer extends Container {
	private String content;
	private String contentFile;
	private String containerExpression;

	/**
	 * 返回以HTML形式定义的控件内容。
	 */
	@IdeProperty(editor = "multiLines")
	public String getContent() {
		return content;
	}

	/**
	 * 设置以HTML形式定义的控件内容。
	 */
	public void setContent(String content) {
		this.content = content;
	}

	@ClientProperty(ignored = true)
	public String getContentFile() {
		return contentFile;
	}

	public void setContentFile(String contentFile) {
		this.contentFile = contentFile;
	}

	/**
	 * 返回作为子控件容器的子DOM对象的CSS或XPath选择表达式。
	 */
	public String getContainerExpression() {
		return containerExpression;
	}

	/**
	 * 设置作为子控件容器的子DOM对象的CSS或XPath选择表达式。
	 */
	public void setContainerExpression(String containerExpression) {
		this.containerExpression = containerExpression;
	}
}
