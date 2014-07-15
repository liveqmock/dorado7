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

var v = [ 89, 35, 12, 785, 578, 54, 13, 589, 1452 ];

function test1() {
	var it = new dorado.util.ArrayIterator(v);

	var i = 0;
	while (it.hasNext()) {
		assertEquals(v[i], it.next());
		i++;
	}
	assertEquals(v.length, i);
}

function test2() {
	var it = new dorado.util.ArrayIterator(v);

	var i = v.length;
	it.last();
	while (it.hasPrevious()) {
		i--;
		assertEquals(v[i], it.previous());
	}
	assertEquals(0, i);

	it.first();
	i = 0;
	while (it.hasNext()) {
		assertEquals(v[i], it.next());
		i++;
	}
	assertEquals(v.length, i);
}
