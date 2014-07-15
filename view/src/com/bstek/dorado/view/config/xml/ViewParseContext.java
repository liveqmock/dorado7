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

package com.bstek.dorado.view.config.xml;

import java.util.Stack;

import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.bstek.dorado.data.config.xml.DataParseContext;
import com.bstek.dorado.view.config.definition.ViewConfigDefinition;
import com.bstek.dorado.view.registry.ComponentTypeRegisterInfo;
import com.bstek.dorado.view.registry.LayoutTypeRegisterInfo;

/**
 * 视图配置文件的解析上下文。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jan 19, 2008
 */
public class ViewParseContext extends DataParseContext {
	public static class LayoutInfo {
		private Element containerElement;
		private LayoutTypeRegisterInfo layoutTypeRegisterInfo;

		public LayoutInfo(Element containerElement,
				LayoutTypeRegisterInfo layoutTypeRegisterInfo) {
			this.containerElement = containerElement;
			this.layoutTypeRegisterInfo = layoutTypeRegisterInfo;
		}

		public Element getContainerElement() {
			return containerElement;
		}

		public LayoutTypeRegisterInfo getLayoutTypeRegisterInfo() {
			return layoutTypeRegisterInfo;
		}
	}

	private String currentPath;
	private ViewConfigDefinition viewConfigDefinition;
	private ComponentTypeRegisterInfo currentComponentTypeRegisterInfo;
	private Stack<LayoutInfo> currentLayoutStack = new Stack<LayoutInfo>();

	@Override
	public void setResourceName(String resourceName) {
		super.setResourceName(resourceName);
		int i = resourceName.lastIndexOf('/');
		currentPath = (i > 0) ? resourceName.substring(0, i + 1) : "";
	}

	public String getCurrentPath() {
		return currentPath;
	}

	/**
	 * 返回当前正被解析的视图配置声明对象。
	 */
	public ViewConfigDefinition getViewConfigDefinition() {
		return viewConfigDefinition;
	}

	/**
	 * 设置当前正被解析的视图配置声明对象。
	 */
	public void setViewConfigDefinition(
			ViewConfigDefinition viewConfigDefinition) {
		this.viewConfigDefinition = viewConfigDefinition;
	}

	public ComponentTypeRegisterInfo getCurrentComponentTypeRegisterInfo() {
		return currentComponentTypeRegisterInfo;
	}

	public void setCurrentComponentTypeRegisterInfo(
			ComponentTypeRegisterInfo currentComponentTypeRegisterInfo) {
		this.currentComponentTypeRegisterInfo = currentComponentTypeRegisterInfo;
	}

	/**
	 * 返回下级子控件隶属的的布局管理器。
	 */
	public LayoutInfo getCurrentLayout() {
		if (currentLayoutStack.size() > 0) {
			return currentLayoutStack.lastElement();
		}
		return null;
	}

	/**
	 * 设置下级子控件隶属的的布局管理器。
	 */
	public void setCurrentLayout(LayoutInfo layout) throws Exception {
		currentLayoutStack.push(layout);
	}

	/**
	 * 还原至堆栈中的前一个布局管理器。
	 */
	public void restoreCurrentLayout() {
		if (currentLayoutStack.size() > 0) {
			currentLayoutStack.pop();
		}
	}

	@Override
	public String getPrivateNameSection(Node node) {
		if (node instanceof Element) {
			Node parentNode = node.getParentNode();
			if (parentNode != null) {
				if (ViewXmlConstants.VIEW_CONFIG.equals(parentNode
						.getNodeName()))
					return null;
			}
		}
		return super.getPrivateNameSection(node);
	}

}
