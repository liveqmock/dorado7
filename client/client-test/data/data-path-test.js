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

var path, dataPath, compiledPath, section;

function testCompile1() {
	path = null;
	dataPath = new dorado.DataPath(path);
	dataPath.compile();
	assertEquals(dorado.DataPath.prototype._ALL, dataPath._compiledPath);
}

function testCompile2() {
	path = "";
	dataPath = new dorado.DataPath(path);
	dataPath.compile();
	assertEquals(dorado.DataPath.prototype._ALL, dataPath._compiledPath);
}

function testCompile3() {
	path = "*";
	dataPath = new dorado.DataPath(path);
	dataPath.compile();
	assertEquals(dorado.DataPath.prototype._ALL, dataPath._compiledPath);
}

function testCompile4() {
	path = "#";
	dataPath = new dorado.DataPath(path);
	dataPath.compile();
	assertEquals(dorado.DataPath.prototype._CURRENT, dataPath._compiledPath);
}

function testCompile5() {
	path = "[#current]";
	dataPath = new dorado.DataPath(path);
	dataPath.compile();
	assertEquals(dorado.DataPath.prototype._CURRENT, dataPath._compiledPath);
}

function testCompile6() {
	path = "[#dirty]";
	dataPath = new dorado.DataPath(path);
	dataPath.compile();
	compiledPath = dataPath._compiledPath;
	assertEquals(1, compiledPath.length);
}

function testCompile7() {
	path = ".employees(R)[@.get(\"salary\")>3500 && @.get(\"sex\")==\"male\"]";
	dataPath = new dorado.DataPath(path);
	dataPath.compile();
	compiledPath = dataPath._compiledPath;
	assertEquals(2, compiledPath.length);
	section = compiledPath[0];
	assertFalse(!!section.property);
	assertFalse(!!section.repeat);
	assertFalse(!!section.leaf);
	section = compiledPath[1];
	assertEquals("employees", section.property);
	assertTrue(!!section.repeat);
	assertFalse(!!section.leaf);
}

function testCompile8() {
	path = ".employees(R)[@.get(\"salary\")>3500,@.get(\"sex\")==\"male\"]";
	dataPath = new dorado.DataPath(path);
	dataPath.compile();
	compiledPath = dataPath._compiledPath;
	assertEquals(2, compiledPath.length);
	section = compiledPath[0];
	assertFalse(!!section.property);
	assertFalse(!!section.repeat);
	assertFalse(!!section.leaf);
	section = compiledPath[1];
	assertTrue(!!section.repeat);
	assertFalse(!!section.leaf);
}

function testCompile9() {
	path = ".departments(leaf)";
	dataPath = new dorado.DataPath(path);
	dataPath.compile();
	compiledPath = dataPath._compiledPath;
	assertEquals(2, compiledPath.length);
	section = compiledPath[0];
	assertFalse(!!section.property);
	assertFalse(!!section.repeat);
	assertFalse(!!section.leaf);
	section = compiledPath[1];
	assertTrue(!!section.repeat);
	assertTrue(!!section.leaf);
}

function testCompile10() {
	path = "#.#departments(L)";
	dataPath = new dorado.DataPath(path);
	dataPath.compile();
	compiledPath = dataPath._compiledPath;
	assertEquals(2, compiledPath.length);
	section = compiledPath[0];
	assertFalse(!!section.property);
	assertFalse(!!section.repeat);
	assertFalse(!!section.leaf);
	assertEquals(2, section.visibility);
	section = compiledPath[1];
	assertTrue(!!section.repeat);
	assertTrue(!!section.leaf);
}

function testCompile11() {
	path = ".departments[#modified]";
	dataPath = new dorado.DataPath(path);
	dataPath.compile();
	compiledPath = dataPath._compiledPath;
	assertEquals(2, compiledPath.length);
	section = compiledPath[0];
	assertFalse(!!section.property);
	assertFalse(!!section.repeat);
	assertFalse(!!section.leaf);
	section = compiledPath[1];
	assertFalse(!!section.repeat);
	assertFalse(!!section.leaf);
	assertEquals(5, section.visibility);
}

function testCompile12() {
	path = ".#departments(R,10).#employees";
	dataPath = new dorado.DataPath(path);
	dataPath.compile();
	compiledPath = dataPath._compiledPath;
	assertEquals(3, compiledPath.length);
	section = compiledPath[0];
	assertFalse(!!section.repeat);
	assertFalse(!!section.leaf);
	section = compiledPath[1];
	assertTrue(!!section.repeat);
	assertFalse(!!section.leaf);
	assertEquals(2, section.visibility);
	assertEquals(10, section.max);
	section = compiledPath[2];
	assertFalse(!!section.repeat);
	assertFalse(!!section.leaf);
	assertEquals(2, section.visibility);
}

// -------------------------------------------------

var DATA_HR = Test.getJSON(Test.ROOT + "resource/hr-data.js");

var data, results, result;

function testEvaluate1() {
	path = null;
	data = DATA_HR;
	dataPath = new dorado.DataPath(path);
	results = dataPath.evaluate(data);

	assertEquals(2, results.length);
	assertEquals("D1", results[0].id);
	assertEquals("D2", results[1].id);
}

function testEvaluate2() {
	path = "*";
	data = DATA_HR;
	dataPath = new dorado.DataPath(path);
	results = dataPath.evaluate(data);

	assertEquals(2, results.length);
	assertEquals("D1", results[0].id);
	assertEquals("D2", results[1].id);
}

function testEvaluate3() {
	path = "*.departments";
	data = DATA_HR;
	dataPath = new dorado.DataPath(path);
	results = dataPath.evaluate(data);

	assertEquals(3, results.length);
	assertEquals("D11", results[0].id);
	assertEquals("D12", results[1].id);
	assertEquals("D21", results[2].id);
}

function testEvaluate4() {
	path = "*.departments.employees";
	data = DATA_HR;
	dataPath = new dorado.DataPath(path);
	results = dataPath.evaluate(data);

	assertEquals(7, results.length);
	assertEquals("0001", results[0].id);
	assertEquals("John", results[0].name);
	assertEquals("0010", results[6].id);
	$.each(results, function() {
		assertTrue(this.id.charAt(0) == '0');
	});
}

function testEvaluate5() {
	path = "departments(repeat)";
	data = DATA_HR;
	dataPath = new dorado.DataPath(path);
	results = dataPath.evaluate(data);

	assertEquals(7, results.length);
	assertEquals("D1", results[0].id);
	assertEquals("D11", results[1].id);
	$.each(results, function() {
		assertTrue(this.id.charAt(0) == 'D');
	});
}

function testEvaluate6() {
	path = "departments(leaf)";
	data = DATA_HR;
	dataPath = new dorado.DataPath(path);
	results = dataPath.evaluate(data);

	assertEquals(4, results.length);
	assertEquals("D11", results[0].id);
	assertEquals("D121", results[1].id);
	$.each(results, function() {
		assertTrue(this.id.charAt(0) == 'D');
	});
}

function testEvaluate7() {
	path = "departments(L).employees";
	data = DATA_HR;
	dataPath = new dorado.DataPath(path);
	results = dataPath.evaluate(data);

	assertEquals(8, results.length);
	assertEquals("0001", results[0].id);
	assertEquals("0002", results[1].id);
	assertEquals("0003", results[2].id);
	$.each(results, function() {
		assertTrue(this.id.charAt(0) == '0');
	});
}

function testEvaluate8() {
	path = "departments(R).employees";
	data = DATA_HR;
	dataPath = new dorado.DataPath(path);
	results = dataPath.evaluate(data);

	assertEquals(10, results.length);
	assertEquals("0001", results[0].id);
	assertEquals("0002", results[1].id);
	assertEquals("0010", results[9].id);
	$.each(results, function() {
		assertTrue(this.id.charAt(0) == '0');
	});
}

function testEvaluate9() {
	path = "departments(R).employees.id";
	data = DATA_HR;
	dataPath = new dorado.DataPath(path);
	results = dataPath.evaluate(data);

	assertEquals(10, results.length);
	assertEquals("0001", results[0]);
	assertEquals("0002", results[1]);
	assertEquals("0010", results[9]);
	$.each(results, function() {
		assertTrue(this.charAt(0) == '0');
	});
}

function testEvaluate10() {
	path = "departments(R,3)";
	data = DATA_HR;
	dataPath = new dorado.DataPath(path);
	results = dataPath.evaluate(data);

	assertEquals(3, results.length);
	assertEquals("D1", results[0].id);
	assertEquals("D11", results[1].id);
	$.each(results, function() {
		assertTrue(this.id.charAt(0) == 'D');
	});
}

function testEvaluate11() {
	path = "departments(R).employees(1)";
	data = DATA_HR;
	dataPath = new dorado.DataPath(path);
	results = dataPath.evaluate(data);

	assertEquals(5, results.length);
	assertEquals("0001", results[0].id);
	assertEquals("0004", results[1].id);
	$.each(results, function() {
		assertTrue(this.id.charAt(0) == '0');
	});
}

function testEvaluate12() {
	path = "departments(R).employees[@.salary>5000]";
	data = DATA_HR;
	dataPath = new dorado.DataPath(path);
	results = dataPath.evaluate(data);

	assertEquals(7, results.length);
	$.each(results, function() {
		assertTrue(this.salary > 5000);
	});
}

function testEvaluate13() {
	path = "departments(R).employees[@.salary<6000,@.sex=='female']";
	data = DATA_HR;
	dataPath = new dorado.DataPath(path);
	results = dataPath.evaluate(data);

	assertEquals(4, results.length);
	$.each(results, function() {
		assertTrue(this.salary < 6000);
		assertTrue(this.sex == "female");
	});
}

function testEvaluate14() {
	path = "departments(R).employees[@.salary<6000 && @.sex=='female']";
	data = DATA_HR;
	dataPath = new dorado.DataPath(path);
	results = dataPath.evaluate(data);

	assertEquals(4, results.length);
	$.each(results, function() {
		assertTrue(this.salary < 6000);
		assertTrue(this.sex == "female");
	});
}

function getEntityData() {
	var entityData = Test.getJSON(Test.ROOT + "resource/hr-data.js");
	return new dorado.EntityList(entityData, null, getDepartmentsDataType());
}

function testEvaluateOnEntity1() {
	var departments = getEntityData();

	path = "departments(R).employees.id";
	dataPath = new dorado.DataPath(path);
	results = dataPath.evaluate(departments);

	assertEquals(10, results.length);
	assertEquals("0001", results[0]);
	assertEquals("0002", results[1]);
	assertEquals("0010", results[9]);
	$.each(results, function() {
		assertTrue(this.charAt(0) == '0');
	});
}

function testEvaluateOnEntity2() {
	var departments = getEntityData();

	path = "departments(R).employees[@.get('salary')<6000 && @.get('sex')=='female']";
	dataPath = new dorado.DataPath(path);
	results = dataPath.evaluate(departments);
	assertEquals(4, results.length);
	$.each(results, function() {
		assertTrue(this.get("salary") < 6000);
		assertTrue(this.get("sex") == "female");
	});
}

function testEvaluateOnEntity3() {
	var departments = getEntityData();

	path = "#";
	dataPath = new dorado.DataPath(path);
	results = dataPath.evaluate(departments);
	assertEquals("D1", results.get("id"));

	departments.next();
	results = dataPath.evaluate(departments);
	assertEquals("D2", results.get("id"));

	departments.first();
	results = dataPath.evaluate(departments);
	assertEquals("D1", results.get("id"));
}

function testEvaluateOnEntity4() {
	var departments = getEntityData();

	path = "#";
	dataPath = new dorado.DataPath(path);
	result = dataPath.evaluate(departments, true);
	assertEquals("D1", result.get("id"));

	departments.next();
	result = dataPath.evaluate(departments, true);
	assertEquals("D2", result.get("id"));
}

function testEvaluateOnEntity5() {
	var departments = getEntityData();

	path = "#departments(R)";
	dataPath = new dorado.DataPath(path);
	results = dataPath.evaluate(departments);
	assertEquals(2, results.length);
	assertEquals("D1", results[0].get("id"));
	assertEquals("D11", results[1].get("id"));
}

function testEvaluateOnEntity6() {
	var departments = getEntityData();

	path = "#departments(L)";
	dataPath = new dorado.DataPath(path);
	results = dataPath.evaluate(departments);
	assertEquals("D11", results.get("id"));

	departments.next();
	result = dataPath.evaluate(departments);
	assertEquals("D21", result.get("id"));

	departments.first();
	result = dataPath.evaluate(departments, true);
	assertEquals("D11", result.get("id"));

	departments.current.get("departments").next();
	result = dataPath.evaluate(departments, true);
	assertEquals("D121", result.get("id"));

	path = "#departments(L).employees";
	dataPath = new dorado.DataPath(path);
	results = dataPath.evaluate(departments);
	assertEquals(2, results.length);
	assertEquals("0006", results[0].get("id"));
	assertEquals("0007", results[1].get("id"));

	path = "#departments(L).#employees";
	dataPath = new dorado.DataPath(path);
	result = dataPath.evaluate(departments, true);
	assertEquals("0006", result.get("id"));
}

function testEvaluateOnEntity7() {
	var departments = getEntityData();

	path = ".departments";
	dataPath = new dorado.DataPath(path);
	results = dataPath.evaluate(departments, {
		acceptAggregation: true
	});
	assertEquals(2, results.length);
	assertTrue(results[0] instanceof dorado.EntityList);
}

function testEvaluateOnEntity8() {
	var departments = getEntityData();
	departments.remove();

	departments.current.set("name", "MODIFIED");

	var department = new dorado.Entity();
	department.set("id", "NEW_ID");
	department.set("name", "NEW_NAME");
	departments.insert(department);

	path = "[#dirty]";
	dataPath = new dorado.DataPath(path);
	results = dataPath.evaluate(departments);
	assertEquals(3, results.length);
	assertEquals(results[0].state, dorado.Entity.STATE_DELETED);
	assertEquals(results[1].state, dorado.Entity.STATE_MODIFIED);
	assertEquals(results[2].state, dorado.Entity.STATE_NEW);
}

function testGetDataType1() {
	var deptDataType = getDepartmentsDataType();
	path = "";
	dataPath = new dorado.DataPath(path);

	var dataType = dataPath.getDataType(deptDataType);
	assertEquals(dataType, deptDataType.get("elementDataType"));

	dataType = dataPath.getDataType(deptDataType, true);
	assertEquals(dataType, deptDataType);
}

function testGetDataType2() {
	var deptDataType = getDepartmentsDataType();
	path = ".employees(R)[@.get(\"salary\")>3500,@.get(\"sex\")==\"male\"]";
	dataPath = new dorado.DataPath(path);

	var dataType = dataPath.getDataType(deptDataType);
	assertEquals("EmployeeDataType", dataType.get("name"));
}

function testGetDataType3() {
	var deptDataType = getDepartmentsDataType();
	path = "departments(L).employees.salary";
	dataPath = new dorado.DataPath(path);

	var dataType = dataPath.getDataType(deptDataType);
	assertEquals("float", dataType.get("name"));
}
