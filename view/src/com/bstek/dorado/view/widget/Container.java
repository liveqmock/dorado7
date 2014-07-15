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

import java.util.ArrayList;
import java.util.List;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.annotation.XmlSubNode;
import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.util.proxy.ChildrenListSupport;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.layout.Layout;

/**
 * 容器组件。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 23, 2008
 */
@Widget(name = "Container", category = "General", dependsPackage = "widget")
@XmlNode(definitionType = "com.bstek.dorado.view.config.definition.ContainerDefinition", parser = "spring:dorado.containerParser", clientTypes = {
		ClientType.DESKTOP, ClientType.TOUCH })
@ClientObject(prototype = "dorado.widget.Container", shortTypeName = "Container", outputter = "spring:dorado.containerOutputter")
public class Container extends Control {

	private class ChildrenList<E> extends ChildrenListSupport<E> {
		public ChildrenList(List<E> target) {
			super(target);
		}

		@Override
		protected void childAdded(E child) {
			doAddChild((Component) child, -1);
		}

		@Override
		protected void childRemoved(E child) {
			doRemoveChild((Component) child);
		}
	}

	private List<Component> children;
	private List<Component> childrenProxy;
	private transient List<ContainerListener> containerListeners;
	private Layout layout;
	private Overflow contentOverflow;
	private Overflow contentOverflowX;
	private Overflow contentOverflowY;
	private String containerUi = "default";

	/**
	 * 返回布局管理对象。
	 */
	@XmlProperty(ignored = true)
	@ClientProperty
	@IdeProperty(visible = false)
	public Layout getLayout() {
		return layout;
	}

	/**
	 * 设置布局管理对象。
	 */
	public void setLayout(Layout layout) {
		this.layout = layout;
	}

	public Overflow getContentOverflow() {
		return contentOverflow;
	}

	public void setContentOverflow(Overflow contentOverflow) {
		this.contentOverflow = contentOverflow;
	}

	public Overflow getContentOverflowX() {
		return contentOverflowX;
	}

	public void setContentOverflowX(Overflow contentOverflowX) {
		this.contentOverflowX = contentOverflowX;
	}

	public Overflow getContentOverflowY() {
		return contentOverflowY;
	}

	public void setContentOverflowY(Overflow contentOverflowY) {
		this.contentOverflowY = contentOverflowY;
	}

	@ClientProperty(escapeValue = "default")
	@IdeProperty(enumValues = "default,optional1")
	public String getContainerUi() {
		return containerUi;
	}

	public void setContainerUi(String containerUi) {
		this.containerUi = containerUi;
	}

	/**
	 * 内部的用于返回子组件集合的方法。
	 */
	protected List<Component> internalGetChildren() {
		if (children == null)
			children = new ArrayList<Component>();
		return children;
	}

	/**
	 * 向容器中添加一个子控件。
	 * 
	 * @param component
	 *            要添加的子控件
	 */
	public void addChild(Component component) {
		addChild(component, -1);
	}

	/**
	 * 向容器中添加一个子控件，同时指定该子控件的布局条件。
	 * 
	 * @param component
	 *            要添加的子控件
	 * @param index
	 *            新添加的子控件在兄弟子控件中的位置序号，该序号是从0开始计数的。
	 */
	public void addChild(Component component, int index) {
		List<Component> children = internalGetChildren();
		if (index == -1) {
			children.add(component);
		} else {
			children.add(index, component);
		}

		doAddChild(component, index);
	}

	protected void doAddChild(Component component, int index) {
		Container originParent = (Container) component.getParent();
		if (originParent != null) {
			originParent.removeChild(component);
			component.setParent(null);
			originParent.unregisterInnerElement(component);
		}
		this.registerInnerElement(component);
		component.setParent(this);

		if (hasContainerListener()) {
			ContainerEvent event = new ContainerEvent(this, component);
			fireChildAdded(event);
		}
	}

	/**
	 * 从容器中移除一个子控件。
	 * 
	 * @param component
	 *            要移除的子控件
	 */
	public void removeChild(Component component) {
		if (internalGetChildren().remove(component)) {
			doRemoveChild(component);
		} else {
			throw new IllegalStateException(
					"The child to be remove does not belong to this Container.");
		}
	}

	protected void doRemoveChild(Component component) {
		component.setParent(null);
		this.unregisterInnerElement(component);

		if (hasContainerListener()) {
			ContainerEvent event = new ContainerEvent(this, component);
			fireChildRemoved(event);
		}
	}

	/**
	 * 返回容器中是否包含任何子控件。
	 */
	public boolean hasChild() {
		return (children != null && !children.isEmpty());
	}

	/**
	 * 返回所有子控件的集合。
	 */
	@XmlSubNode(nodeName = "*", parser = "spring:dorado.childComponentParser")
	@ClientProperty
	public List<Component> getChildren() {
		if (childrenProxy == null) {
			childrenProxy = new ChildrenList<Component>(internalGetChildren());
		}
		return childrenProxy;
	}

	/**
	 * 添加一个容器监听器。
	 * 
	 * @param l
	 */
	public void addContainerListener(ContainerListener l) {
		if (containerListeners == null) {
			containerListeners = new ArrayList<ContainerListener>();
		}
		containerListeners.add(l);
	}

	/**
	 * 移除一个容器监听器。
	 * 
	 * @param l
	 */
	public void removeContainerListener(ContainerListener l) {
		if (containerListeners != null) {
			containerListeners.remove(l);
		}
	}

	/**
	 * 返回当前容器中是否关联有任何监听器。
	 */
	protected boolean hasContainerListener() {
		return (containerListeners != null && !containerListeners.isEmpty());
	}

	/**
	 * 触发一个“添加子控件”的事件。
	 * 
	 * @param event
	 *            事件描述对象
	 */
	protected void fireChildAdded(ContainerEvent event) {
		if (containerListeners != null) {
			for (ContainerListener l : containerListeners) {
				l.childAdded(event);
			}
		}
	}

	/**
	 * 触发一个“移除子控件”的事件。
	 * 
	 * @param event
	 *            事件描述对象
	 */
	protected void fireChildRemoved(ContainerEvent event) {
		if (containerListeners != null) {
			for (ContainerListener l : containerListeners) {
				l.childRemoved(event);
			}
		}
	}

}
