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

function testNewId() {
	dorado._ID_SEED = 1000;
	assertEquals("_uid_1001", dorado.Core.newId());
	assertEquals("_uid_1002", dorado.Core.newId());
	assertEquals("_uid_1003", dorado.Core.newId());
}

function testClone() {
	assertEquals("ABCD", dorado.Core.clone("ABCD"));
	assertEquals(346, dorado.Core.clone(346));
	assertEquals(34.6, dorado.Core.clone(34.6));
	assertEquals(false, dorado.Core.clone(false));

	var date = new Date();
	assertEquals(date.getTime(), dorado.Core.clone(date).getTime());

	var v = [ 5, true, new Date() ];
	var clonedV = dorado.Core.clone(v);
	assertEquals(v.length, clonedV.length);
	for ( var i = 0; i < v.length; i++) {
		assertEquals(v[i], clonedV[i]);
	}

	var o = {
		p1: 6,
		p2: false,
		p3: "GHES"
	};
	var clonedO = dorado.Core.clone(o);
	assertEquals(o.p1, clonedO.p1);
	assertEquals(o.p2, clonedO.p2);
	assertEquals(o.p3, clonedO.p3);

	o = {
		p1: 6,
		p2: false,
		p3: "AAA",

		clone: function(obj) {
			var cloned = {};
			dorado.Object.apply(cloned, this);
			cloned.p3 = "BBB";
			return cloned;
		}
	};
	clonedO = dorado.Core.clone(o);
	assertEquals(o.p1, clonedO.p1);
	assertEquals(o.p2, clonedO.p2);
	assertEquals("BBB", clonedO.p3);
}
