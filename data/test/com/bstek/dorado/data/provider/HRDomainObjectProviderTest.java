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

import com.bstek.dorado.data.config.ConfigManagerTestSupport;
import com.bstek.dorado.data.entity.EntityUtils;
import com.bstek.dorado.data.model.Department;
import com.bstek.dorado.data.model.Employee;
import com.bstek.dorado.data.provider.DataProvider;
import com.bstek.dorado.data.type.DataType;

public class HRDomainObjectProviderTest extends ConfigManagerTestSupport {
	@SuppressWarnings("unchecked")
	public void test1() throws Exception {
		DataProvider dataProvider = getDataProviderManager().getDataProvider(
				"testHRDomainObjectProvider1");
		List<Department> depts = (List<Department>) dataProvider.getResult();
		assertNotNull(depts);
		assertEquals(10, depts.size());

		DataType dataType;
		Department d;
		Employee e;

		dataType = EntityUtils.getDataType(depts);
		assertNotNull(dataType);
		assertEquals("List", dataType.getName());

		d = depts.get(0);
		dataType = EntityUtils.getDataType(d);
		assertNotNull(dataType);
		assertEquals("domain.Department", dataType.getName());

		e = d.getEmployees().get(0);
		dataType = EntityUtils.getDataType(e);
		assertNotNull(dataType);
		assertEquals("domain.Employee", dataType.getName());
	}
}
