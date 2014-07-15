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

import java.util.HashMap;
import java.util.Map;

import com.bstek.dorado.util.DeepCloneableLinkedHashMap;

import junit.framework.TestCase;

public class DeepCloneableLinkedHashMapTest extends TestCase {
	private DeepCloneableLinkedHashMap<Object, Object> map = null;

	@Override
	protected void setUp() throws Exception {
		super.setUp();
		map = new DeepCloneableLinkedHashMap<Object, Object>();
	}

	@Override
	protected void tearDown() throws Exception {
		map = null;
		super.tearDown();
	}

	@SuppressWarnings("unchecked")
	public void testClone() {
		final String key1 = "key1";
		final String key2 = "key2";

		map.put(key1, new Object());
		map.put(key2, new HashMap<Object, Object>());

		Map<Object, Object> clonedMap = (Map<Object, Object>) map.clone();

		assertSame(map.get(key1), clonedMap.get(key1));
		assertNotSame(map.get(key2), clonedMap.get(key2));
	}

}
