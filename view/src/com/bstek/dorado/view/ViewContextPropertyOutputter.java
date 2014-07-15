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

package com.bstek.dorado.view;

import java.util.Map;

import com.bstek.dorado.core.Context;
import com.bstek.dorado.view.output.DataOutputter;
import com.bstek.dorado.view.output.JsonBuilder;
import com.bstek.dorado.view.output.OutputContext;
import com.bstek.dorado.view.output.VirtualPropertyOutputter;
import com.bstek.dorado.web.DoradoContext;
import com.bstek.dorado.web.DoradoContextUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-5-12
 */
public class ViewContextPropertyOutputter extends DataOutputter implements
		VirtualPropertyOutputter {

	public void output(Object object, String property, OutputContext context)
			throws Exception {
		Context doradoContext = Context.getCurrent();
		if (!(doradoContext instanceof DoradoContext)) {
			return;
		}

		View view = (View) object;
		Map<String, Object> viewContext = DoradoContextUtils
				.getViewContextByBindingObject((DoradoContext) doradoContext,
						view.getViewConfig());
		if (viewContext != null && !viewContext.isEmpty()) {
			JsonBuilder json = context.getJsonBuilder();
			json.key(property).beginValue();
			super.output(viewContext, context);
			json.endValue();
		}
	}

}
