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

package com.bstek.dorado.view.registry;


import com.bstek.dorado.core.Context;
import com.bstek.dorado.view.ViewContextTestCase;
import com.bstek.dorado.view.widget.MockDataSet;

public class DefaultComponentRegistryTest extends ViewContextTestCase {
	public void test() throws Exception {
		Context context = Context.getCurrent();
		ComponentTypeRegistry componentTypeRegistry = (ComponentTypeRegistry) context
				.getServiceBean("componentTypeRegistry");
		ComponentTypeRegisterInfo componentRegisterInfo;

		componentRegisterInfo = componentTypeRegistry
				.getRegisterInfo("TestDataSet");
		assertNotNull(componentRegisterInfo);

		componentRegisterInfo = componentTypeRegistry
				.getRegisterInfo(MockDataSet.class);
		assertNotNull(componentRegisterInfo);
	}
}
