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

package com.bstek.dorado.view.widget.layout;

import com.bstek.dorado.view.output.JsonBuilder;
import com.bstek.dorado.view.output.ObjectOutputterDispatcher;
import com.bstek.dorado.view.output.OutputContext;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-2-28
 */
public class LayoutConstraintPropertyOutputter extends
		ObjectOutputterDispatcher {
	@Override
	public void output(Object object, OutputContext context) throws Exception {
		if (object == Layout.NON_LAYOUT_CONSTRAINT) {
			JsonBuilder json = context.getJsonBuilder();
			json.beginValue();
			context.getWriter().append(
					"dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT");
			json.endValue();
		} else {
			outputObject(object, context);
		}
	}

}
