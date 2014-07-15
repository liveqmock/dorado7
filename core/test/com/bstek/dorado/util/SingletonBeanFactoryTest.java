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

package com.bstek.dorado.util;

import com.bstek.dorado.util.SingletonBeanFactory;

import junit.framework.TestCase;

public class SingletonBeanFactoryTest extends TestCase {

	public void testGetInstance() throws IllegalAccessException,
			InstantiationException {
		Object instance1 = SingletonBeanFactory
				.getInstance(java.util.HashMap.class);
		Object instance2 = SingletonBeanFactory
				.getInstance(java.util.HashMap.class);
		Object instance3 = SingletonBeanFactory
				.getInstance(java.util.HashMap.class);
		assertTrue(instance1 == instance2);
		assertTrue(instance2 == instance3);
	}
}
