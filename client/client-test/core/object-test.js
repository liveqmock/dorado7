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

function testCreateClass1(){
	var Class1 = dorado.Object.createClass({
		constructor: function(message){
			this.message = message;
		},
		getMessage: function(){
			return this.message;
		}
	});
	var class1 = new Class1("Hello world!");
	assertEquals("Hello world!", class1.getMessage());
}

function testCreateClass2(){
	var Class1 = $class({
		$className: "Class1",
		
		getMessage1: function(){
			return "A";
		}
	});
	
	var Class2 = $class({
		getMessage2: function(){
			return "B";
		}
	});

	assertNotEquals(Class1, Class2);
	
	var class1 = new Class1();
	assertEquals("A", class1.getMessage1());
	assertEquals("Class1", Class1.className);
	assertUndefined(class1.getMessage2);
	
	var class2 = new Class2();
	assertTrue(!!Class1.className);
	assertEquals("B", class2.getMessage2());
	assertUndefined(class2.getMessage1);
}

function Foo1(arg){
	this.argOfFoo1 = arg;
}

var Foo2 = dorado.Object.extend(Foo1, {
	propertyOfFoo2: "value2"
});

var Foo3 = dorado.Object.extend(Foo2, {
	constructor: function(arg){
		Foo3.superClass.constructor.apply(this, arguments);
		this.argOfFoo3 = arg;
	},
	
	propertyOfFoo3: "value3"
});

var Foo4 = dorado.Object.extend(Foo3, {
	propertyOfFoo3: "value4"
});

function testExtend1(){
	var foo2 = new Foo2("value1");
	assertEquals("value1", foo2.argOfFoo1);
	assertEquals("value2", foo2.propertyOfFoo2);
	
	foo2.argOfFoo2 = "$value2";
	var _foo2 = new Foo2("value1");
	assertEquals("$value2", foo2.argOfFoo2);
	assertEquals("value2", _foo2.propertyOfFoo2);
}

function testExtend2(){
	var foo3 = new Foo3("value1");
	assertEquals("value1", foo3.argOfFoo1);
	assertEquals("value1", foo3.argOfFoo3);
	assertEquals("value2", foo3.propertyOfFoo2);
	assertEquals("value3", foo3.propertyOfFoo3);
}

function testExtend3(){
	var foo4 = new Foo4("value1");
	assertEquals("value1", foo4.argOfFoo1);
	assertEquals("value1", foo4.argOfFoo3);
	assertEquals("value2", foo4.propertyOfFoo2);
	assertEquals("value4", foo4.propertyOfFoo3);
}

function testApply(){
	function listener(property, value){
		if (property == "prop2") {
			this[property] = value * 2;
			return false;
		} else if (property == "prop3") {
			return false;
		}
	};
	
	var target = {};
	var source = {
		prop1: 100,
		prop2: 200,
		prop3: 300
	};
	dorado.Object.apply(target, source, listener);
	
	assertEquals(100, target.prop1);
	assertEquals(400, target.prop2);
	assertUndefined(target.prop3);
}

function testScopify() {
	var s = "hello";
	var result;
	result = dorado.Core.scopify(s, function() {
		return this;
	})();
	assertTrue(s == result);
	
	result = dorado.Core.scopify(s, "this")();
	assertTrue(s == result);
}

function testIsInstanceOf() {
	var tree = new dorado.widget.Tree();
	assertTrue(dorado.Object.isInstanceOf(tree, dorado.EventSupport));
}
