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

import java.io.IOException;
import java.io.Writer;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.common.event.ClientEvent;
import com.bstek.dorado.common.event.ClientEventSupported;
import com.bstek.dorado.common.event.DynaSignatureClientEvent;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-12-11
 */
public class ClientEventListenersOutputter implements VirtualPropertyOutputter {
	private static final String DEFAULT_SIGNATURE = "self,arg";

	public void output(Object object, String property, OutputContext context)
			throws Exception {
		if (object instanceof ClientEventSupported) {
			JsonBuilder json = context.getJsonBuilder();
			json.escapeableKey(property).escapeableObject();
			ClientEventSupported ces = (ClientEventSupported) object;
			for (Map.Entry<String, List<ClientEvent>> entry : ces
					.getAllClientEventListeners().entrySet()) {
				String eventName = entry.getKey();
				List<ClientEvent> listeners = entry.getValue();
				if (listeners.isEmpty()) {
					continue;
				}

				json.escapeableKey(eventName);
				if (listeners.size() == 1) {
					outputListener(listeners.get(0), context);
				} else {
					json.escapeableArray();
					for (ClientEvent listener : listeners) {
						if (StringUtils.isNotEmpty(listener.getScript())) {
							outputListener(listener, context);
						}
					}
					json.endArray();
				}
				json.endKey();
			}
			json.endObject().endKey();
		}
	}

	protected void outputListener(ClientEvent listener, OutputContext context)
			throws IOException {
		JsonBuilder json = context.getJsonBuilder();
		Writer writer = context.getWriter();
		String signature;
		if (listener instanceof DynaSignatureClientEvent) {
			signature = StringUtils.defaultIfEmpty(
					((DynaSignatureClientEvent) listener).getSignature(),
					DEFAULT_SIGNATURE);
		} else {
			signature = DEFAULT_SIGNATURE;
		}

		if (DEFAULT_SIGNATURE.equals(signature)) {
			json.beginValue();
			writer.append("function(").append(signature).append("){\n")
					.append(listener.getScript()).append("\n}");
			json.endValue();
		} else {
			json.object().key("fn").beginValue();
			writer.append("function(").append(signature).append("){\n")
					.append(listener.getScript()).append("\n}");
			json.endValue();
			json.key("options").object().key("autowire").value(true)
					.endObject();
			json.endObject();
		}
	}

}
