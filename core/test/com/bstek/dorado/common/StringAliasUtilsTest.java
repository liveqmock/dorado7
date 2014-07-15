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

package com.bstek.dorado.common;

import com.bstek.dorado.util.StringAliasUtils;

import junit.framework.TestCase;

public class StringAliasUtilsTest extends TestCase {
	public void test() {
		String s1 = "junit.framework.TestCase";
		String s2 = "D:\\My Documents\\dorado 7\\workspace\\config\\test\\org\\dorado\\config";
		String s3 = "a";
		String s4 = "1234";
		String s5 = "4321";
		String alias1, alias2, alias3, alias4, alias5;

		alias1 = StringAliasUtils.getUniqueAlias(s1);
		alias2 = StringAliasUtils.getUniqueAlias(s2);
		alias3 = StringAliasUtils.getUniqueAlias(s3);
		alias4 = StringAliasUtils.getUniqueAlias(s4);
		alias5 = StringAliasUtils.getUniqueAlias(s5);

		System.out.println(alias1);
		System.out.println(alias2);
		System.out.println(alias3);
		System.out.println(alias4);
		System.out.println(alias5);

		assertFalse(alias1.equals(alias2));
		assertFalse(alias2.equals(alias3));
		assertFalse(alias3.equals(alias4));
		assertFalse(alias4.equals(alias5));

		assertEquals(alias1, StringAliasUtils.getUniqueAlias(s1));
		assertEquals(alias2, StringAliasUtils.getUniqueAlias(s2));
		assertEquals(alias3, StringAliasUtils.getUniqueAlias(s3));
		assertEquals(alias4, StringAliasUtils.getUniqueAlias(s4));
		assertEquals(alias5, StringAliasUtils.getUniqueAlias(s5));
	}
}
