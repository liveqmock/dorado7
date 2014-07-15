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

package com.bstek.dorado.view.registry;

import java.util.Map;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.view.config.ViewConfigDefinitionFactory;
import com.bstek.dorado.view.config.definition.ComponentDefinition;
import com.bstek.dorado.view.config.definition.ViewConfigDefinition;
import com.bstek.dorado.view.config.definition.ViewDefinition;
import com.bstek.dorado.view.manager.ViewConfigManager;
import com.bstek.dorado.view.widget.Component;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-7-5
 */
public class AssembledComponentTypeRegisterInfo extends
		ComponentTypeRegisterInfo implements
		LazyInitailizeComponentTypeRegistryInfo {
	private ViewConfigManager viewConfigManager;
	private ComponentTypeRegistry componentTypeRegistry;

	private boolean definitionLoaded;
	private String src;
	private ComponentDefinition superComponentDefinition;
	private Map<String, VirtualPropertyDescriptor> virtualProperties;
	private Map<String, VirtualEventDescriptor> virtualEvents;

	public AssembledComponentTypeRegisterInfo(String name) {
		super(name);
	}

	public void setViewConfigManager(ViewConfigManager viewConfigManager) {
		this.viewConfigManager = viewConfigManager;
	}

	public void setComponentTypeRegistry(
			ComponentTypeRegistry componentTypeRegistry) {
		this.componentTypeRegistry = componentTypeRegistry;
	}

	public String getSrc() {
		return src;
	}

	public void setSrc(String src) {
		this.src = src;
	}

	public ComponentDefinition getSuperComponentDefinition() {
		return superComponentDefinition;
	}

	public Map<String, VirtualPropertyDescriptor> getVirtualProperties() {
		return virtualProperties;
	}

	public void setVirtualProperties(
			Map<String, VirtualPropertyDescriptor> virtualProperties) {
		this.virtualProperties = virtualProperties;
	}

	public Map<String, VirtualEventDescriptor> getVirtualEvents() {
		return virtualEvents;
	}

	public void setVirtualEvents(
			Map<String, VirtualEventDescriptor> virtualEvents) {
		this.virtualEvents = virtualEvents;
	}

	public boolean isInitialized() {
		return definitionLoaded;
	}

	public void initialize() throws Exception {
		definitionLoaded = true;

		String name = getName();
		Class<? extends Component> classType = getClassType();
		if (StringUtils.isEmpty(src) && classType == null) {
			throw new IllegalArgumentException(
					"Both src and classType undefined");
		}

		if (StringUtils.isNotEmpty(src)) {
			String viewName, componentId = null;
			int i = src.lastIndexOf('#');
			if (i < 0) {
				viewName = src;
			} else {
				viewName = src.substring(0, i);
				componentId = src.substring(i + 1);
			}

			ViewConfigDefinition viewConfig = null;
			Object viewConfigFactory = viewConfigManager
					.getViewConfigFactory(viewName);
			if (viewConfigFactory != null
					&& viewConfigFactory instanceof ViewConfigDefinitionFactory) {
				ViewConfigDefinitionFactory vcdf = (ViewConfigDefinitionFactory) viewConfigFactory;
				viewConfig = vcdf.create(viewName);
			}
			if (viewConfig == null) {
				throw new IllegalArgumentException("AssembleComponent view ["
						+ viewName + "] not found.");
			}

			ViewDefinition view = viewConfig.getViewDefinition();
			if (StringUtils.isEmpty(componentId)) {
				superComponentDefinition = view;
			} else {
				superComponentDefinition = view.getComponent(componentId);
			}
			if (superComponentDefinition == null) {
				throw new IllegalArgumentException("AssembleComponent [" + name
						+ "] not found in [" + src + "].");
			}
			ComponentTypeRegisterInfo superRegisterInfo = componentTypeRegistry
					.getRegisterInfo(superComponentDefinition
							.getComponentType());

			if (classType == null) {
				classType = superRegisterInfo.getClassType();
				setClassType(classType);
			}
		}
	}
}
