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

import java.util.List;

import com.bstek.dorado.data.model.Department;
import com.bstek.dorado.data.model.TestDataHolder;
import com.bstek.dorado.data.resolver.DataItems;

public class TestHRDomainDataResolver1 {

	@SuppressWarnings("unchecked")
	public void resolve(DataItems dataItems, Object parameter) {
		List<Department> departments = (List<Department>) dataItems
				.get("dataSet");
		TestDataHolder.updateDomainTestData1(departments);
	}
}
