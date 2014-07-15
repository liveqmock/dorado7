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

package com.bstek.dorado.data.resolver.manager;

import com.bstek.dorado.data.resolver.DataItems;
import com.bstek.dorado.data.resolver.DataResolver;

public class TestDataResolverInterceptor {
	public String method1() {
		return "Return value of method1";
	}

	public DataItems method2(DataItems dataItems) {
		return dataItems;
	}

	public DataItems method3(DataItems dataItems, Object parameter) {
		return dataItems;
	}

	public String method4(DataResolver dataResolver, int parameter) {
		return String.valueOf(parameter);
	}

	public String method5(String value1, int value2, float value4,
			boolean parameter) {
		return "method5-" + value1 + value2 + value4 + parameter;
	}
}
