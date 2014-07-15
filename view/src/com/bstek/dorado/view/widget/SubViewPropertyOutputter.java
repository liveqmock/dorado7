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

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.common.event.DefaultClientEvent;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.view.View;
import com.bstek.dorado.view.manager.ViewConfig;
import com.bstek.dorado.view.manager.ViewConfigManager;
import com.bstek.dorado.view.output.JsonBuilder;
import com.bstek.dorado.view.output.ObjectOutputterDispatcher;
import com.bstek.dorado.view.output.OutputContext;
import com.bstek.dorado.view.output.VirtualPropertyOutputter;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-6-19
 */
public class SubViewPropertyOutputter extends ObjectOutputterDispatcher
		implements VirtualPropertyOutputter {
	private ViewConfigManager viewConfigManager;

	public void setViewConfigManager(ViewConfigManager viewConfigManager) {
		this.viewConfigManager = viewConfigManager;
	}

	public void output(Object object, String property, OutputContext context)
			throws Exception {
		SubViewHolder subViewHolder = (SubViewHolder) object;
		String viewName = subViewHolder.getSubView();
		Map<String, Object> subContext = subViewHolder.getContext();

		if (StringUtils.isNotEmpty(viewName)) {
			if (subContext != null && !subContext.isEmpty()) {
				Context doradoContext = Context.getCurrent();
				for (Map.Entry<String, Object> entry : subContext.entrySet()) {
					doradoContext
							.setAttribute(entry.getKey(), entry.getValue());
				}
			}

			ViewConfig viewConfig = viewConfigManager.getViewConfig(viewName);
			View view = null;
			JsonBuilder jsonBuilder = context.getJsonBuilder();
			jsonBuilder.key(property);
			jsonBuilder.beginValue();
			if (viewConfig != null) {
				view = viewConfig.getView();
				if (view != null) {
					super.outputObject(view, context);
				}
			}
			jsonBuilder.endValue();

			if (view != null && StringUtils.isNotEmpty(view.getPageTemplate())) {
				String calloutId = "subview_" + context.getCalloutId();
				context.addCalloutHtml(view, calloutId);

				StringBuffer script = new StringBuffer();
				script.append("self.assignDom(document.getElementById(\"")
						.append(calloutId).append("\"));");

				view.addClientEventListener("onCreate", new DefaultClientEvent(
						script.toString()));
			}
		}
	}
}
