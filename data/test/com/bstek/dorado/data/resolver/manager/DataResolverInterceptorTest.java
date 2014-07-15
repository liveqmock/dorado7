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

import com.bstek.dorado.data.config.ConfigManagerTestSupport;
import com.bstek.dorado.data.resolver.DataItems;
import com.bstek.dorado.data.resolver.DataResolver;

public class DataResolverInterceptorTest extends ConfigManagerTestSupport {
	public void testMethod1() throws Exception {
		DataResolver resolver = getDataResolverManager().getDataResolver(
				"resolverWithInterceptor1");
		assertNotNull(resolver);
		assertEquals("Return value of method1", resolver.resolve(null, null));
	}

	public void testMethod2() throws Exception {
		DataResolver resolver = getDataResolverManager().getDataResolver(
				"resolverWithInterceptor2");
		assertNotNull(resolver);

		DataItems dataItems = new DataItems();
		assertSame(dataItems, resolver.resolve(dataItems, null));
	}

	public void testMethod3() throws Exception {
		DataResolver resolver = getDataResolverManager().getDataResolver(
				"resolverWithInterceptor3");
		assertNotNull(resolver);

		DataItems dataItems = new DataItems();
		assertSame(dataItems, resolver.resolve(dataItems, null));
	}

	public void testMethod4() throws Exception {
		DataResolver resolver = getDataResolverManager().getDataResolver(
				"resolverWithInterceptor4");
		assertNotNull(resolver);

		DataItems dataItems = new DataItems();
		int i = 999;
		assertEquals(String.valueOf(i), resolver.resolve(dataItems, i));
	}

	public void testMethod5() throws Exception {
		DataResolver resolver = getDataResolverManager().getDataResolver(
				"resolverWithInterceptor5");
		assertNotNull(resolver);

		DataItems dataItems = new DataItems();
		dataItems.put("value1", "Haha");
		dataItems.put("value2", 345);
		dataItems.put("value3", "hihi");
		dataItems.put("value4", 678.9123f);

		boolean parameter = true;
		assertEquals("method5-Haha345678.9123true",
				resolver.resolve(dataItems, parameter));
	}
}
