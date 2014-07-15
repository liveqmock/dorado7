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

var count = {};

var Class1 = $extend([dorado.AttributeSupport, dorado.EventSupport], {
	ATTRIBUTES: {
		prop1: {},
		
		prop2: {
			getter: function(attr) {
				var p = attr + "_getter";
				count[p] = (count[p] || 0) + 1;
				return this[attr];
			},
			
			setter: function(attr, v) {
				var p = attr + "_setter";
				count[p] = (count[p] || 0) + 1;
				this[attr] = v;
			}
		},
		
		prop3: {
			defaultValue: 534,
			readOnly: true
		},
		
		prop4: {
			writeOnce: true
		}
	},
	
	EVENTS: {
		onClick: {},
		
		beforeOpen: {}
	}
});

var Class2 = $extend(Class1, {
	ATTRIBUTES: {
		prop1: {
			getter: function(attr) {
				var p = attr + "_getter";
				count[p] = (count[p] || 0) + 1;
				return this['_' + attr];
			}
		},
		
		prop5: {}
	}
});

function testSetAndGet() {
	var o = new Class1();
	assertTrue(o instanceof dorado.AttributeSupport);
	
	o.set("prop1", 3456);
	assertEquals(3456, o.get("prop1"));
	
	count = {};
	o.set("prop2", 6789);
	assertEquals(6789, o.get("prop2"));
	assertEquals(1, count.prop2_getter);
	assertEquals(1, count.prop2_setter);
	
	o.set("prop2", 987);
	assertEquals(987, o.get("prop2"));
	assertEquals(2, count.prop2_getter);
	assertEquals(2, count.prop2_setter);
	
	var getFlag = false;
	try {
		o.get("prop0");
	} 
	catch (e) {
		dorado.Exception.removeException(e);
		getFlag = true;
	}
	assertTrue(getFlag);
	
	var setFlag = false;
	try {
		o.set("prop0", '');
	} 
	catch (e) {
		dorado.Exception.removeException(e);
		setFlag = true;
	}
	assertTrue(setFlag);
}

function testSetEventListener() {
	var o = new Class1();
	assertEquals(0, o.getListenerCount("onClick"));
	o.set("onClick", function() {
	});
	assertEquals(1, o.getListenerCount("onClick"));
	o.set({
		onClick: function() {
		}
	});
	assertEquals(2, o.getListenerCount("onClick"));
}

function testBatchSet() {
	var o = new Class1();
	
	count = {};
	o.set({
		prop1: 3456,
		prop2: 6789
	});
	
	assertEquals(3456, o.get("prop1"));
	assertEquals(6789, o.get("prop2"));
	assertEquals(1, count.prop2_getter);
}

function testReadOnly() {
	var o = new Class1();
	
	assertEquals(534, o.get("prop3"));
	var readOnlyFlag = false;
	try {
		o.set("prop3", 545);
	} 
	catch (e) {
		dorado.Exception.removeException(e);
		readOnlyFlag = true;
	}
	assertTrue(readOnlyFlag);
	assertEquals(534, o.get("prop3"));
}

function testWriteOnce() {
	var o = new Class1();
	o.set("prop4", 7643);
	assertEquals(7643, o.get("prop4"));
	var writeOnceFlag = false;
	try {
		o.set("prop4", 5634);
	} 
	catch (e) {
		dorado.Exception.removeException(e);
		writeOnceFlag = true;
	}
	assertTrue(writeOnceFlag);
	assertEquals(7643, o.get("prop4"));
}

function testOverride1() {
	var o1 = new Class1();
	
	count = {};
	o1.set("prop1", 3456);
	assertEquals(3456, o1.get("prop1"));
	assertEquals(0, count.prop1_getter || 0);
	
	var o2 = new Class2();
	
	o2.set("prop1", 5678);
	assertEquals(5678, o2.get("prop1"));
	assertEquals(1, count.prop1_getter);
}

function testOverride2() {
	var o2 = new Class2();
	
	o2.set("prop2", 864);
	assertEquals(864, o2.get("prop2"));
	
	o2.set("prop5", 123);
	assertEquals(123, o2.get("prop5"));
}
