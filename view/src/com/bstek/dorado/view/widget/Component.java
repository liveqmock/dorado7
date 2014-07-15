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

import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.ResourceInjection;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.common.event.ClientEventHolder;
import com.bstek.dorado.common.event.ClientEventSupported;
import com.bstek.dorado.util.proxy.BeanExtender;
import com.bstek.dorado.util.proxy.ProxyBeanUtils;
import com.bstek.dorado.view.ClientEventSupportedElement;
import com.bstek.dorado.view.View;
import com.bstek.dorado.view.manager.ViewConfig;
import com.bstek.dorado.view.registry.AssembledComponentTypeRegisterInfo;
import com.bstek.dorado.view.registry.VirtualEventDescriptor;

/**
 * 组件的抽象类
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jan 19, 2008
 */
@XmlNode(definitionType = "com.bstek.dorado.view.config.definition.ComponentDefinition", parser = "spring:dorado.componentParser")
@ClientObject(prototype = "dorado.widget.Component", shortTypeName = "Component", outputter = "spring:dorado.componentOutputter", properties = { @ClientProperty(propertyName = "DEFINITION", outputter = "spring:dorado.assembledComponentDefOutputter") })
@ClientEvents({
		@com.bstek.dorado.annotation.ClientEvent(name = "onAttributeChange"),
		@com.bstek.dorado.annotation.ClientEvent(name = "onCreate"),
		@com.bstek.dorado.annotation.ClientEvent(name = "onDestroy"),
		@com.bstek.dorado.annotation.ClientEvent(name = "onReady") })
@ResourceInjection
public abstract class Component extends ClientEventSupportedElement {
	private Object userData;

	@Override
	protected ClientEventHolder createClientEventHolder() {
		return new ComponentClientEventHolder(this);
	}

	public ViewConfig getViewConfig() {
		View view = getView();
		return (view != null) ? view.getViewConfig() : null;
	}

	@XmlProperty
	@ClientProperty
	@IdeProperty(editor = "any")
	public Object getUserData() {
		return userData;
	}

	public void setUserData(Object userData) {
		this.userData = userData;
	}

}

class ComponentClientEventHolder extends ClientEventHolder {
	private Component component;

	@SuppressWarnings("unchecked")
	public ComponentClientEventHolder(Component component) {
		super((Class<? extends ClientEventSupported>) ProxyBeanUtils
				.getProxyTargetType(component));
		this.component = component;
	}

	@Override
	protected void checkEventAvailable(String eventName) {
		try {
			super.checkEventAvailable(eventName);
		} catch (IllegalArgumentException e) {
			AssembledComponentTypeRegisterInfo componentTypeRegisterInfo = (AssembledComponentTypeRegisterInfo) BeanExtender
					.getExProperty(component, "$assembledComponentInfo");
			if (componentTypeRegisterInfo == null) {
				throw e;
			} else {
				boolean valid = false;
				Map<String, VirtualEventDescriptor> virtualEvents = componentTypeRegisterInfo
						.getVirtualEvents();
				if (virtualEvents != null) {
					valid = virtualEvents.containsKey(eventName);
				}
				if (!valid) {
					throw new IllegalArgumentException(
							"Unrecognized client event ["
									+ componentTypeRegisterInfo.getName() + ","
									+ eventName + "].");
				}
			}
		}
	}
}
