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
import com.bstek.dorado.data.resolver.DataResolver;
import com.bstek.dorado.data.resolver.TestDataResolver;
import com.bstek.dorado.data.resolver.manager.DataResolverManager;

public class DataResolverManagerTest extends ConfigManagerTestSupport {
	public void testGetDataResolver() throws Exception {
		DataResolverManager dataResolverManager = getDataResolverManager();
		assertNotNull(dataResolverManager);

		DataResolver resolver = dataResolverManager
				.getDataResolver("testResolver1");
		assertNotNull(resolver);

		assertEquals("testResolver1", resolver.getName());
		assertEquals(TestDataResolver.class, resolver.getClass());

		String param = "ABC";
		assertEquals("testResolver1-parameter:" + param,
				resolver.resolve(null, param));
	}
}
