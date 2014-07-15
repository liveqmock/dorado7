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

package com.bstek.dorado.data.provider.manager;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import com.bstek.dorado.data.config.ConfigManagerTestSupport;
import com.bstek.dorado.data.provider.DataProvider;
import com.bstek.dorado.data.provider.Page;

public class DataProviderInterceptorTest extends ConfigManagerTestSupport {
	public void test1() throws Exception {
		DataProvider dataProvider = getDataProviderManager().getDataProvider(
				"providerWithInterceptor1");
		assertNotNull(dataProvider);

		Object result = dataProvider.getResult(new Integer(100));
		assertEquals(new Integer(100 * 3), result);
	}

	public void test2() throws Exception {
		final String PREFIX = "#$^";
		final String ORIGIN_RESULT = "oooops";

		DataProvider dataProvider = getDataProviderManager().getDataProvider(
				"providerWithInterceptor2");
		assertNotNull(dataProvider);

		Object result = dataProvider.getResult(PREFIX);
		assertEquals(PREFIX + ORIGIN_RESULT, result);
	}

	public void test3() throws Exception {
		final String PREFIX = "#$^";

		DataProvider dataProvider = getDataProviderManager().getDataProvider(
				"providerWithInterceptor3");
		assertNotNull(dataProvider);

		Object result = dataProvider.getResult(PREFIX);
		assertEquals(PREFIX + dataProvider.getName(), result);
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public void test4() throws Exception {
		DataProvider dataProvider = getDataProviderManager().getDataProvider(
				"providerWithInterceptor4");
		assertNotNull(dataProvider);

		Map parameter = new HashMap();
		parameter.put("p1", "hihihi");
		parameter.put("p2", 123);
		parameter.put("p3", 45.67);
		parameter.put("p4", "hohoho");
		parameter.put("p5", true);

		Object result = dataProvider.getResult(parameter);
		assertEquals("providerWithInterceptor4hihihi12345.67true", result);
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public void testGetPagingData1() throws Exception {
		final String PREFIX = "Entity";

		DataProvider dataProvider = getDataProviderManager().getDataProvider(
				"providerPagingData1");
		assertNotNull(dataProvider);

		Page page;
		List<Properties> entities;

		page = new Page(10, 1);
		dataProvider.getPagingResult(PREFIX, page);
		entities = (List<Properties>) page.getEntities();
		assertNotNull(entities);
		assertEquals(10, entities.size());
		assertEquals(PREFIX + "-6", entities.get(5).get("key"));

		page = new Page(10, 8);
		dataProvider.getPagingResult(PREFIX, page);
		entities = (List<Properties>) page.getEntities();
		assertNotNull(entities);
		assertEquals(10, entities.size());
		assertEquals(PREFIX + "-76", entities.get(5).get("key"));
	}
}
