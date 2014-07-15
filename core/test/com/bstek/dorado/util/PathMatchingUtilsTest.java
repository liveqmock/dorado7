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

import com.bstek.dorado.util.PathUtils;

import junit.framework.TestCase;

public class PathMatchingUtilsTest extends TestCase {
	public void test() {
		assertFalse(PathUtils.match("*", "abc/ab"));
		assertFalse(PathUtils.match("*", "/abc/ab"));
		assertTrue(PathUtils.match("**", "abc/ab"));
		assertFalse(PathUtils.match("**", "/abc/ab"));
		assertTrue(PathUtils.match("**", "abc/ab.abc"));
		assertTrue(PathUtils.match("/**", "/abc/ab"));
		assertTrue(PathUtils.match("**/*.*", "abc.abc"));
		assertTrue(PathUtils.match("**/*.*", "abc.abc"));
		assertTrue(PathUtils.match("**", "abc"));
		assertFalse(PathUtils.match("*/*", "abc"));
		assertTrue(PathUtils.match("*/*", "abc/ab"));
		assertTrue(PathUtils.match("*/ab", "abc/ab"));
		assertFalse(PathUtils.match("*/ab", "abc/abc"));
		assertTrue(PathUtils.match("*/ab*", "abc/ab"));
		assertTrue(PathUtils.match("*.*", "abc.ab"));
		assertTrue(PathUtils.match("abc/ab*", "abc/ab"));
		assertTrue(PathUtils.match("abc/*", "abc/ab"));
		assertFalse(PathUtils.match("abc/*", "abc/ab/abc"));
	}
}
