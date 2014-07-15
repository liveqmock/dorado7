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

import java.io.Writer;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.view.output.JsonBuilder;
import com.bstek.dorado.view.output.OutputContext;
import com.bstek.dorado.view.output.OutputUtils;
import com.bstek.dorado.view.output.PropertyOutputter;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-6-24
 */
public class ComponentReferencePropertyOutputter implements PropertyOutputter {

	public boolean isEscapeValue(Object value) {
		return OutputUtils.isEscapeValue(value);
	}

	public void output(Object object, OutputContext context) throws Exception {
		Writer writer = context.getWriter();
		JsonBuilder jsonBuilder = context.getJsonBuilder();
		String id = String.valueOf(object);
		String[] ids = StringUtils.split(id, ',');
		if (ids.length > 1) {
			jsonBuilder.array();
			for (int i = 0; i < ids.length; i++) {
				jsonBuilder.beginValue();
				writer.append("view.getComponentReference(\"");
				writer.append(ids[i]);
				writer.append("\")");
				jsonBuilder.endValue();
			}
			jsonBuilder.endArray();
		} else {
			jsonBuilder.beginValue();
			writer.append("view.getComponentReference(\"");
			writer.append(id);
			writer.append("\")");
			jsonBuilder.endValue();
		}
	}
}
