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

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.util.clazz.ClassUtils;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.manager.ViewConfigManager;
import com.bstek.dorado.view.widget.AssembledComponent;
import com.bstek.dorado.view.widget.Component;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-7-5
 */
public class AssembledComponentTypeRegister extends ComponentTypeRegister {
	private ViewConfigManager viewConfigManager;

	private String src;
	private Map<String, Properties> virtualProperties;
	private Map<String, Properties> virtualEvents;

	public void setViewConfigManager(ViewConfigManager viewConfigManager) {
		this.viewConfigManager = viewConfigManager;
	}

	public String getSrc() {
		return src;
	}

	public void setSrc(String src) {
		this.src = src;
	}

	public Map<String, Properties> getVirtualProperties() {
		return virtualProperties;
	}

	public void setVirtualProperties(Map<String, Properties> virtualProperties) {
		this.virtualProperties = virtualProperties;
	}

	public Map<String, Properties> getVirtualEvents() {
		return virtualEvents;
	}

	public void setVirtualEvents(Map<String, Properties> virtualEvents) {
		this.virtualEvents = virtualEvents;
	}

	@Override
	protected ComponentTypeRegisterInfo createRegisterInfo(String name) {
		AssembledComponentTypeRegisterInfo registerInfo = new AssembledComponentTypeRegisterInfo(
				name);
		registerInfo.setViewConfigManager(viewConfigManager);
		registerInfo.setComponentTypeRegistry(getComponentTypeRegistry());
		return registerInfo;
	}

	@Override
	protected ComponentTypeRegisterInfo getRegisterInfo() throws Exception {
		AssembledComponentTypeRegisterInfo registerInfo = (AssembledComponentTypeRegisterInfo) super
				.getRegisterInfo();

		Class<? extends Component> cl = registerInfo.getClassType();
		if (cl != null && !AssembledComponent.class.isAssignableFrom(cl)) {
			throw new IllegalArgumentException(cl + " should implements "
					+ AssembledComponent.class + ".");
		}

		registerInfo.setSrc(src);

		String category = null;
		Widget widget = null;
		if (cl != null) {
			widget = cl.getAnnotation(Widget.class);
			if (widget != null
					&& ArrayUtils.indexOf(cl.getDeclaredAnnotations(), widget) >= 0) {
				category = widget.category();
			}
		}
		registerInfo.setCategory((StringUtils.isEmpty(category)) ? "Others"
				: category);

		Map<String, VirtualPropertyDescriptor> propertieDescriptors = new HashMap<String, VirtualPropertyDescriptor>();
		if (virtualProperties != null) {
			for (Map.Entry<String, Properties> entry : virtualProperties
					.entrySet()) {
				String propertyName = entry.getKey();
				Properties properties = entry.getValue();
				VirtualPropertyDescriptor propertyDescriptor = new VirtualPropertyDescriptor();
				propertyDescriptor.setName(propertyName);

				String type = properties.getProperty("type");
				if (StringUtils.isNotEmpty(type)) {
					propertyDescriptor.setType(ClassUtils.forName(type));
				}

				String avialableAt = properties.getProperty("avialableAt");
				if (StringUtils.isNotEmpty(avialableAt)) {
					propertyDescriptor
							.setAvialableAt(VirtualPropertyAvialableAt
									.valueOf(avialableAt));
				}

				propertyDescriptor.setDefaultValue(properties
						.getProperty("defaultValue"));
				propertyDescriptor.setReferenceComponentType(properties
						.getProperty("referenceComponentType"));
				propertieDescriptors.put(propertyName, propertyDescriptor);
			}
		}
		registerInfo.setVirtualProperties(propertieDescriptors);

		Map<String, VirtualEventDescriptor> eventDescriptors = new HashMap<String, VirtualEventDescriptor>();
		if (virtualEvents != null) {
			for (Map.Entry<String, Properties> entry : virtualEvents.entrySet()) {
				String eventName = entry.getKey();
				VirtualEventDescriptor eventDescriptor = new VirtualEventDescriptor();
				eventDescriptor.setName(eventName);
				eventDescriptors.put(eventName, eventDescriptor);
			}
		}
		registerInfo.setVirtualEvents(eventDescriptors);
		return registerInfo;
	}
}
