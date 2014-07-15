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

package com.bstek.dorado.data.resolver;

import java.util.Map;

import com.bstek.dorado.data.resolver.AbstractDataResolver;
import com.bstek.dorado.data.resolver.DataItems;

public class TestDataResolver extends AbstractDataResolver {

	@Override
	protected Object internalResolve(DataItems dataItems, Object parameter)
			throws Exception {
		if ("Exception".equals(parameter)) {
			throw new RuntimeException("Test Exception");
		}

		String s = "testResolver1-";
		if (dataItems != null && !dataItems.isEmpty()) {
			for (Map.Entry<String, Object> entry : dataItems.entrySet()) {
				s += entry.getKey() + ":" + entry.getValue() + ";";
			}
		}
		s += "parameter:" + parameter;
		return s;
	}

}
