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

package com.bstek.dorado.core.bean;

import com.bstek.dorado.core.bean.Scope;
import com.bstek.dorado.core.bean.ScopeManager;

import junit.framework.TestCase;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 26, 2008
 */
public class ScopeManagerTest extends TestCase {
	public void testSingletonPutAndGet() {
		final String KEY = Object.class.getName();
		ScopeManager sm = new ScopeManager();
		Object o = new Object();
		sm.putBean(Scope.singleton, KEY, o);
		assertSame(o, sm.getBean(Scope.singleton, KEY));
	}

	public void testInstantPutAndGet() {
		final String KEY = Object.class.getName();
		ScopeManager sm = new ScopeManager();
		Object o = new Object();
		sm.putBean(Scope.instant, KEY, o);
		assertNull(sm.getBean(Scope.instant, KEY));
	}
}
