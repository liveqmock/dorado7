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

import java.util.List;
import java.util.Map;

import com.bstek.dorado.data.config.ConfigManagerTestSupport;
import com.bstek.dorado.data.provider.DataProvider;
import com.bstek.dorado.data.provider.manager.DataProviderManager;
import com.bstek.dorado.data.type.AggregationDataType;
import com.bstek.dorado.data.type.EntityDataType;

public class DataProviderManagerTest extends ConfigManagerTestSupport {

	@SuppressWarnings("unchecked")
	public void testGetDataProvider() throws Exception {
		DataProviderManager dataProviderManager = getDataProviderManager();
		assertNotNull(dataProviderManager);

		DataProvider provider = dataProviderManager
				.getDataProvider("testProvider1");
		assertNotNull(provider);

		AggregationDataType resultDataType = (AggregationDataType) provider
				.getResultDataType();
		assertNotNull(resultDataType);

		EntityDataType elementDataType = (EntityDataType) resultDataType
				.getElementDataType();
		assertNotNull(elementDataType);
		assertEquals(Map.class, elementDataType.getMatchType());

		assertEquals(3, elementDataType.getPropertyDefs().size());

		List<Object> result = (List<Object>) provider.getResult();
		assertNotNull(result);
		assertEquals(3, result.size());
	}

	public void testInstantScope() throws Exception {
		DataProviderManager dataProviderManager = getDataProviderManager();

		final String name = "testProvider1";
		DataProvider dp1 = dataProviderManager.getDataProvider(name);
		DataProvider dp2 = dataProviderManager.getDataProvider(name);
		assertNotSame(dp1, dp2);
	}

	public void testSingletonScope() throws Exception {
		DataProviderManager dataProviderManager = getDataProviderManager();

		final String name = "testProvider2";
		DataProvider dp1 = dataProviderManager.getDataProvider(name);
		DataProvider dp2 = dataProviderManager.getDataProvider(name);
		assertSame(dp1, dp2);
	}

}
