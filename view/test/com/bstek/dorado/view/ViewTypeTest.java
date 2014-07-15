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

package com.bstek.dorado.view;


import com.bstek.dorado.core.Context;
import com.bstek.dorado.data.type.DefaultEntityDataType;
import com.bstek.dorado.data.type.EntityDataType;
import com.bstek.dorado.data.type.manager.DataTypeManager;

public class ViewTypeTest extends ViewContextTestCase {

	protected DataTypeManager getDataTypeManager() throws Exception {
		Context conetxt = Context.getCurrent();
		DataTypeManager dataTypeManager = (DataTypeManager) conetxt
				.getServiceBean("dataTypeManager");
		return dataTypeManager;
	}

	public void test() throws Exception {
		EntityDataType beanDataType = (EntityDataType) getDataTypeManager()
				.getDataType("Bean");
		assertNotNull(beanDataType);
		assertTrue(DefaultEntityDataType.class.isInstance(beanDataType));
	}
}
