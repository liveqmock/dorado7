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

import java.io.IOException;
import java.util.List;

import com.bstek.dorado.data.model.Department;
import com.bstek.dorado.data.model.TestDataHolder;

public class TestHRDomainObjectProvider1 {

	public List<Department> getResult() throws IOException {
		return TestDataHolder.getDomainTestData1();
	}
}
