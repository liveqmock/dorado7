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

function doTestCollection(list) {
	function MockData(id) {
		this.id = id;
	}

	var objs = [];
	for ( var i = 0; i < 10; i++) {
		var data = new MockData("obj" + i);
		objs.push(data);
		list.append(data);
	}
	assertEquals(10, list.size);
	assertTrue(list.indexOf(objs[6]) == 6);

	list.remove(objs[6]);
	assertEquals(9, list.size);
	assertTrue(list.indexOf(objs[6]) <= 0);

	list.insert(objs[6], 6);
	assertEquals(10, list.size);
	assertTrue(list.indexOf(objs[6]) == 6);

	var i = 0;
	for ( var it = list.iterator(); it.hasNext();) {
		var obj = it.next();
		assertEquals(objs[i++], obj);
	}
}

function test() {
	var list = new dorado.util.KeyedArray();
	doTestCollection(list);
}

function testWithGetKeyFunction() {
	var list = new dorado.util.KeyedArray(function(data) {
		return data.id;
	});
	doTestCollection(list);
}

function testDeepClone() {
	var list = new dorado.util.KeyedArray(function(data) {
		return data.id;
	});
	for ( var i = 0; i < 10; i++) {
		list.append( {
			p: "data$" + i
		});
	}
	var cloned = list.deepClone();

	assertEquals(list.size, cloned.size);
	var clonedIt = cloned.iterator();
	for ( var it = list.iterator(); it.hasNext();) {
		var obj = it.next();
		var clonedObj = clonedIt.next();
		assertTrue(obj != clonedObj);
		assertEquals(obj.p, clonedObj.p);
	}
}
