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

import java.lang.reflect.Array;

import com.bstek.dorado.data.entity.EntityUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-12-11
 */
public class DefaultPropertyOutputter implements PropertyOutputter {
	private Outputter objectOutputter;

	public void setObjectOutputter(Outputter objectOutputter) {
		this.objectOutputter = objectOutputter;
	}

	public boolean isEscapeValue(Object value) {
		return OutputUtils.isEscapeValue(value);
	}

	public void output(Object object, OutputContext context) throws Exception {
		JsonBuilder json = context.getJsonBuilder();
		if (EntityUtils.isSimpleValue(object)) {
			json.value(object);
		} else if (object.getClass().isArray()
				&& EntityUtils.isSimpleType(object.getClass()
						.getComponentType())) {
			json.beginValue();
			json.array();
			for (int size = Array.getLength(object), i = 0; i < size; i++) {
				Object element = Array.get(object, i);
				json.value(element);
			}
			json.endArray();
			json.endValue();
		} else {
			json.beginValue();
			objectOutputter.output(object, context);
			json.endValue();
		}
	}
}
