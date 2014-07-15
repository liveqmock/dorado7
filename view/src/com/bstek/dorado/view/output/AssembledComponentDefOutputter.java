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

package com.bstek.dorado.view.output;

import java.util.Map;

import com.bstek.dorado.util.proxy.BeanExtender;
import com.bstek.dorado.view.registry.AssembledComponentTypeRegisterInfo;
import com.bstek.dorado.view.registry.VirtualEventDescriptor;
import com.bstek.dorado.view.registry.VirtualPropertyAvialableAt;
import com.bstek.dorado.view.registry.VirtualPropertyDescriptor;

/**
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-7-29
 */
public class AssembledComponentDefOutputter implements VirtualPropertyOutputter {

	public void output(Object object, String property, OutputContext context)
			throws Exception {
		AssembledComponentTypeRegisterInfo componentTypeRegisterInfo = (AssembledComponentTypeRegisterInfo) BeanExtender
				.getExProperty(object, "$assembledComponentInfo");
		if (componentTypeRegisterInfo != null) {
			JsonBuilder json = context.getJsonBuilder();
			json.escapeableKey(property).escapeableObject();

			Map<String, VirtualPropertyDescriptor> virtualProperties = componentTypeRegisterInfo
					.getVirtualProperties();
			if (virtualProperties != null && !virtualProperties.isEmpty()) {
				json.escapeableKey("ATTRIBUTES").escapeableObject();
				for (Map.Entry<String, VirtualPropertyDescriptor> entry : virtualProperties
						.entrySet()) {
					VirtualPropertyDescriptor propertyDescriptor = entry
							.getValue();
					VirtualPropertyAvialableAt avialableAt = propertyDescriptor
							.getAvialableAt();
					if (VirtualPropertyAvialableAt.both.equals(avialableAt)
							|| VirtualPropertyAvialableAt.client
									.equals(avialableAt)) {
						json.key(entry.getKey()).object().endObject();
					}
				}
				json.endObject().endKey();
			}

			Map<String, VirtualEventDescriptor> virtualEvents = componentTypeRegisterInfo
					.getVirtualEvents();
			if (virtualEvents != null && !virtualEvents.isEmpty()) {
				json.escapeableKey("EVENTS").escapeableObject();
				for (String eventName : virtualEvents.keySet()) {
					json.key(eventName).object().endObject();
				}
				json.endObject().endKey();
			}

			json.endObject().endKey();
		}
	}

}
