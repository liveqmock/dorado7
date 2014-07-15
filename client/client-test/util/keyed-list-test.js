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
	assertTrue(list.findEntry(objs[6]) != null);

	list.remove(objs[6]);
	assertEquals(9, list.size);
	assertTrue(list.findEntry(objs[6]) == null);

	list.insert(objs[6], "before", objs[7]);
	assertEquals(10, list.size);
	assertTrue(list.findEntry(objs[6]) != null);

	var i = 0;
	for ( var it = list.iterator(); it.hasNext();) {
		var obj = it.next();
		assertEquals(objs[i], obj);
		i++;
	}
}

function test() {
	var list = new dorado.util.KeyedList();
	doTestCollection(list);
}

function testWithGetKeyFunction() {
	var list = new dorado.util.KeyedList(function(data) {
		return data.id;
	});
	doTestCollection(list);
}

function testClone() {
	var list = new dorado.util.KeyedList();
	for ( var i = 0; i < 10; i++)
		list.append("data$" + i);
	var cloned = dorado.Core.clone(list);

	assertEquals(list.size, cloned.size);
	var clonedIt = cloned.iterator();
	for ( var it = list.iterator(); it.hasNext();) {
		var obj = it.next();
		var clonedObj = clonedIt.next();
		assertEquals(obj, clonedObj);
	}
}

function testDeepClone() {
	var list = new dorado.util.KeyedList(function(data) {
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

function _testPerformance() {
	var list = new dorado.util.KeyedList(function(data) {
		return data.id;
	});
	var v = [];
	for ( var i = 0; i < 3000; i++) {
		v.push( {
			id: i + ''
		});
	}

	var s = new Date();
	for ( var i = 0; i < v.length; i++) {
		list.insert(v[0]);
	}
	for ( var i = 0; i < v.length; i++) {
		list.remove(v[0]);
	}
	alert(new Date() - s);
}
