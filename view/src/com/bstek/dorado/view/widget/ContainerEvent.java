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

/**
 * 容器事件的描述对象
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 3, 2008
 */
public class ContainerEvent {
	private Container container;
	private Component component;

	/**
	 * @param container 触发事件的容器对象
	 * @param component 事件相关的子控件对象
	 */
	public ContainerEvent(Container container, Component component) {
		this.container = container;
		this.component = component;
	}

	/**
	 * 返回触发事件的容器对象
	 */
	public Container getContainer() {
		return container;
	}

	/**
	 * 返回事件相关的子控件对象
	 */
	public Component getComponent() {
		return component;
	}
}
