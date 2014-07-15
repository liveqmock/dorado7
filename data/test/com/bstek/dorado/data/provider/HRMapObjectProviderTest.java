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

package com.bstek.dorado.data.provider;

import java.util.List;
import java.util.Map;

import com.bstek.dorado.data.config.ConfigManagerTestSupport;
import com.bstek.dorado.data.entity.EntityUtils;
import com.bstek.dorado.data.provider.DataProvider;
import com.bstek.dorado.data.type.DataType;

public class HRMapObjectProviderTest extends ConfigManagerTestSupport {
	@SuppressWarnings({ "rawtypes" })
	public void test1() throws Exception {
		DataProvider dataProvider = getDataProviderManager().getDataProvider(
				"testHRMapObjectProvider1");
		List depts = (List) dataProvider.getResult();
		assertNotNull(depts);
		assertEquals(10, depts.size());

		DataType dataType;
		Map d, e;

		dataType = EntityUtils.getDataType(depts);
		assertNotNull(dataType);
		assertEquals("[map.Department]", dataType.getName());

		d = (Map) depts.get(0);
		dataType = EntityUtils.getDataType(d);
		assertNotNull(dataType);
		assertEquals("map.Department", dataType.getName());

		e = (Map) ((List) d.get("employees")).get(0);
		dataType = EntityUtils.getDataType(e);
		assertNotNull(dataType);
		assertEquals("map.Employee", dataType.getName());
	}
}
