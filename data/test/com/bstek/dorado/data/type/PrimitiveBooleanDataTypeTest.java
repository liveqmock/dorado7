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

package com.bstek.dorado.data.type;

import com.bstek.dorado.data.DataContextTestCase;
import com.bstek.dorado.data.type.PrimitiveBooleanDataType;

public class PrimitiveBooleanDataTypeTest extends DataContextTestCase {
	private PrimitiveBooleanDataType primitiveBooleanDataType = null;

	@Override
	protected void setUp() throws Exception {
		super.setUp();
		primitiveBooleanDataType = new PrimitiveBooleanDataType();
	}

	@Override
	protected void tearDown() throws Exception {
		primitiveBooleanDataType = null;
		super.tearDown();
	}

	public void testConvertFromObject() {
		Object value = this;
		Object result = primitiveBooleanDataType.fromObject(value);
		assertEquals(Boolean.FALSE, result);

		value = null;
		result = primitiveBooleanDataType.fromObject(value);
		assertEquals(Boolean.FALSE, result);

		value = Boolean.TRUE;
		result = primitiveBooleanDataType.fromObject(value);
		assertEquals(Boolean.TRUE, result);
	}

	public void testConvertFromText() {
		String text = "True";
		Object result = primitiveBooleanDataType.fromText(text);
		assertEquals(Boolean.TRUE, result);

		text = "0";
		result = primitiveBooleanDataType.fromText(text);
		assertEquals(Boolean.FALSE, result);
	}

}
