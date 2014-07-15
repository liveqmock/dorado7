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

function testStringDataType() {
	var dataType = dorado.$String;
	assertEquals("abc", dataType.parse("abc"));
	assertTrue(dataType.parse() === null);
}

function testPrimitiveIntDataType() {
	var dataType = dorado.$int;
	assertEquals(123, dataType.parse("123"));
	assertEquals(123, dataType.parse("123.123"));
	assertEquals(0, dataType.parse("abc"));
	assertEquals(0, dataType.parse());
}

function testIntegerDataType() {
	var dataType = dorado.$Integer;
	assertEquals(123, dataType.parse("123"));
	assertEquals(123, dataType.parse("123.123"));
	assertTrue(dataType.parse("abc") === null);
	assertTrue(dataType.parse() === null);
}

function testPrimitiveFloatDataType() {
	var dataType = dorado.$float;
	assertEquals(123, dataType.parse("123"));
	assertEquals(123.123, dataType.parse("123.123"));
	assertEquals(0, dataType.parse("abc"));
	assertEquals(0, dataType.parse());
}

function testFloatDataType() {
	var dataType = dorado.$Float;
	assertEquals(123, dataType.parse("123"));
	assertEquals(123.123, dataType.parse("123.123"));
	assertTrue(dataType.parse("abc") === null);
	assertTrue(dataType.parse() === null);
}

function testPrimitiveBooleanDataType() {
	var dataType = dorado.$boolean;
	assertTrue(dataType.parse("true") === true);
	assertTrue(dataType.parse("false") === false);
	assertTrue(dataType.parse("abc") === false);
	assertTrue(dataType.parse() === false);

	assertTrue(dataType.parse(1) === true);
	assertTrue(dataType.parse(0) === false);
}

function testBooleanDataType() {
	var dataType = dorado.$Boolean;
	assertTrue(dataType.parse("true") === true);
	assertTrue(dataType.parse("false") === false);
	assertTrue(dataType.parse("abc") === false);
	assertTrue(dataType.parse() === null);

	assertTrue(dataType.parse(1) === true);
	assertTrue(dataType.parse(0) === false);

	assertTrue(dataType.parse("T", "T") === true);
	assertTrue(dataType.parse(200, 100) === false);
}

function testDateDataType() {
	var dataType = dorado.$Date;
	assertTrue(dataType.parse(new Date().getTime()) instanceof Date);
	assertTrue(dataType.parse(new Date()) instanceof Date);

	assertTrue(dataType.parse("1976-04-03", "Y-m-d") instanceof Date);
	assertTrue(dataType.parse("19760403", "Ymd") instanceof Date);
	assertTrue(dataType.parse("1976-04-03 06:20:45", "Y-m-d h:i:s") instanceof Date);
	assertTrue(dataType.parse() == null);

	var failed = false;
	try {
		assertTrue(dataType.parse("19760403", "Y-m-d") == null);
	}
	catch (e) {
		failed = true;
	}
	assertTrue(failed);
}

function testEntityDataType() {
	var dataType = new dorado.EntityDataType("TestEntity");
	for ( var i = 0; i < 5; i++) {
		var p = new dorado.BasePropertyDef("p" + i);
		p.label = "label" + i;
		dataType.addPropertyDef(p);
	}
	assertEquals(5, dataType.get("propertyDefs").size);
	assertEquals("p2", dataType.getPropertyDef("p2").get("name"));
}
