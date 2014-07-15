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

package com.bstek.dorado.data.type.property;

import java.util.List;
import java.util.Map;

import com.bstek.dorado.data.config.ConfigManagerTestSupport;
import com.bstek.dorado.data.provider.DataProvider;

public class ReferenceTest extends ConfigManagerTestSupport {

	@SuppressWarnings("rawtypes")
	public void testReference1() throws Exception {
		DataProvider dataProvider = getDataProviderManager().getDataProvider(
				"providerMaster");

		List data = (List) dataProvider.getResult();
		assertEquals(data.size(), 1);

		Map master = (Map) data.get(0);
		assertEquals(master.get("referenceKey"), "key1");
		assertEquals(master.get("reference1"), "54321");
	}
}
