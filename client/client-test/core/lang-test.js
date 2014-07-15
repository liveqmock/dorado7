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

function testArray() {
	var v = [ "A", "B", "C", "D", "E" ];
	assertEquals(5, v.length);

	v.push("F");
	v.push("G");
	assertEquals(7, v.length);

	assertEquals(2, v.indexOf("C"));
	assertEquals(4, v.indexOf("E"));
	assertEquals(6, v.indexOf("G"));
	assertEquals(-1, v.indexOf("Z"));

	v.removeAt(3);
	assertEquals(6, v.length);
	assertEquals(-1, v.indexOf("D"));

	v.removeAt(3);
	assertEquals(5, v.length);
	assertEquals(-1, v.indexOf("E"));
	assertEquals(4, v.indexOf("G"));

	v.insert("D", 3);
	assertEquals(6, v.length);
	assertEquals(3, v.indexOf("D"));
	assertEquals(5, v.indexOf("G"));

	v.insert("E", 4);
	assertEquals(7, v.length);
	assertEquals(3, v.indexOf("D"));
	assertEquals(4, v.indexOf("E"));
	assertEquals(6, v.indexOf("G"));
}
