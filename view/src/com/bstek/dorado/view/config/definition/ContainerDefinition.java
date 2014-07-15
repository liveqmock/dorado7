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

package com.bstek.dorado.view.config.definition;

import java.util.ArrayList;
import java.util.List;

import com.bstek.dorado.config.definition.CreationContext;
import com.bstek.dorado.config.definition.DefinitionUtils;
import com.bstek.dorado.config.definition.ObjectDefinition;
import com.bstek.dorado.util.CloneUtils;
import com.bstek.dorado.view.registry.ComponentTypeRegisterInfo;
import com.bstek.dorado.view.widget.Component;
import com.bstek.dorado.view.widget.Container;

/**
 * 容器组件的配置声明对象。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 28, 2008
 */
public class ContainerDefinition extends ControlDefinition {
	private LayoutDefinition layout;
	private List<ComponentDefinition> children = new ArrayList<ComponentDefinition>();

	public ContainerDefinition(ComponentTypeRegisterInfo registerInfo) {
		super(registerInfo);
	}

	/**
	 * 返回布局管理器的声明。
	 */
	public LayoutDefinition getLayout() {
		return layout;
	}

	/**
	 * 设置布局管理器的声明。
	 */
	public void setLayout(LayoutDefinition layout) {
		this.layout = layout;
	}

	/**
	 * 向容器中添加一个子组件。
	 */
	public void appendChild(ComponentDefinition component) {
		children.add(component);
	}

	/**
	 * 返回容器中所有的子组件。
	 */
	public List<ComponentDefinition> getChildren() {
		return children;
	}

	@Override
	@SuppressWarnings("unchecked")
	protected void doInitObject(Object object, CreationInfo creationInfo,
			CreationContext context) throws Exception {
		super.doInitObject(object, creationInfo, context);

		Container container = (Container) object;
		List<ComponentDefinition> allChilldrens = (List<ComponentDefinition>) creationInfo
				.getUserData("children");
		if (allChilldrens != null) {
			for (Object childDefinition : allChilldrens) {
				Component child = (Component) DefinitionUtils.getRealValue(
						childDefinition, context);
				container.addChild(child);
			}
		}
	}

	@Override
	protected void initCreationInfo(CreationInfo creationInfo,
			ObjectDefinition definition, boolean processConstrInfos)
			throws Exception {
		initChildrenCreationInfo(creationInfo, definition);

		super.initCreationInfo(creationInfo, definition, processConstrInfos);
	}

	@SuppressWarnings("unchecked")
	protected void initChildrenCreationInfo(CreationInfo creationInfo,
			ObjectDefinition definition) {
		ContainerDefinition containerDefinition = (ContainerDefinition) definition;

		if (containerDefinition.getLayout() != null) {
			creationInfo.getProperties().put("layout",
					containerDefinition.getLayout());
		}

		List<ComponentDefinition> allChilldrens = (List<ComponentDefinition>) creationInfo
				.getUserData("children");
		if (allChilldrens == null) {
			allChilldrens = new ArrayList<ComponentDefinition>();
			creationInfo.setUserData("children", allChilldrens);
		}
		allChilldrens.addAll(containerDefinition.getChildren());
	}

	@Override
	protected Object clone() throws CloneNotSupportedException {
		ContainerDefinition definition = (ContainerDefinition) super.clone();
		List<ComponentDefinition> children = new ArrayList<ComponentDefinition>();
		for (ComponentDefinition componentDefinition : definition.children) {
			children.add(((componentDefinition != null) ? CloneUtils
					.clone(componentDefinition) : null));
		}
		definition.children = children;
		return definition;
	}

}
