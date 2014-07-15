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

function setUpPage() {
	Test.preloadAsyncTests( [ AsyncLoad, AsyncComplexDataType, AsyncComplexDataTypeNeverLoad ]);
}

function testDefaultDataTypes() {
	var root = dorado.DataTypeRepository.ROOT;
	assertTrue(root.get("String") != null);
	assertTrue(root.get("int") != null);
	assertTrue(root.get("Long") != null);
	assertTrue(root.get("double") != null);
	assertTrue(root.get("Double") != null);
	assertTrue(root.get("Boolean") != null);
	assertTrue(root.get("Date") != null);
	assertTrue(root.get("Set") != null);
	assertTrue(root.get("Map") != null);
}

function testRegisterAndGet() {

	function loadDataType(name) {
		loadTimes++;
		var dataType = {
			name: "type2",
			type: "entity"
		};
		this.parseJsonData(dataType);
		return dataType;
	}

	var rootRepository = new dorado.DataTypeRepository();
	var repository = new dorado.DataTypeRepository(rootRepository);
	repository._load = loadDataType;

	var dataType = new dorado.DataType("type1");
	repository.register(dataType);
	assertEquals(dataType, repository.get("type1"));

	var loadTimes = 0;
	repository.register("type2");

	var loadedDataType = repository.get("type2");
	assertEquals("type2", loadedDataType.get("name"));
	assertEquals(1, loadTimes);

	assertTrue(loadedDataType == repository.get("type2"));
	assertEquals(1, loadTimes);
}

function testLoad() {
	var repository = new dorado.DataTypeRepository(dorado.DataTypeRepository.ROOT);
	repository.loadOptions = {
		url: Test.ROOT + "resource/load-datatype-department.js"
	};

	var loadTimes = 0;
	jQuery.aop.before( {
		target: repository,
		method: "load"
	}, function() {
		loadTimes++;
	});

	repository.register("Department");
	var dataType = repository.get("Department");

	assertTrue(dataType != null);
	assertEquals("Department", dataType.get("name"));
	assertEquals(4, dataType.get("propertyDefs").size);

	var p = dataType.getPropertyDef("employees");
	assertTrue(p != null);

	dataType = p.get("dataType");
	assertTrue(dataType != null);
	assertEquals("Employees", dataType.get("name"));

	var elementDataType = dataType.get("elementDataType");
	assertTrue(elementDataType != null);
	assertEquals("Employee", elementDataType.get("name"));
	elementDataType.getPropertyDef("sex").get("dataType");
	assertEquals(dorado.$boolean, elementDataType.getPropertyDef("sex").get("dataType"));

	repository.get("Department");
	assertEquals(1, loadTimes);
}

function testLazyLoadDataType() {
	var repository = new dorado.DataTypeRepository();
	repository.loadOptions = {
		url: Test.ROOT + "resource/load-datatype-department.js"
	};

	repository.register("Department");
	var lazyLoadDataType = new dorado.LazyLoadDataType(repository, "Department");
	var dataType = lazyLoadDataType.get();

	assertTrue(dataType != null);
	assertEquals("Department", dataType.get("name"));
	assertEquals(4, dataType.get("propertyDefs").size);
}

function testComplexDataType() {
	var repository = new dorado.DataTypeRepository();
	repository.loadOptions = {
		url: Test.ROOT + "resource/load-datatype-employee.js"
	};
	repository.register("Employee");

	var employees = repository.get("[Employee]");
	assertTrue(employees instanceof dorado.AggregationDataType);
	assertEquals("[Employee]", employees.get("name"));

	var employee = employees.get("elementDataType");
	assertTrue(employee instanceof dorado.EntityDataType);
	assertEquals("Employee", employee.get("name"));

	var employees2 = repository.get("[Employee]");
	assertTrue(employees === employees2);
	assertTrue(employee === employees2.get("elementDataType"));
}

function testComplexDataTypeNeverLoad() {
	var repository = new dorado.DataTypeRepository();
	repository.loadOptions = {
		url: Test.ROOT + "resource/load-datatype-employee.js"
	};
	repository.register("Employee");

	var employees = repository.get("[Employee]", true);
	assertTrue(employees instanceof dorado.AggregationDataType);
	assertEquals("[Employee]", employees.get("name"));
	assertTrue(employees._elementDataType instanceof dorado.LazyLoadDataType);

	var employee = employees.get("elementDataType");
	assertTrue(employee instanceof dorado.EntityDataType);
	assertEquals("Employee", employee.get("name"));
}

var AsyncLoad = {
	load: function() {
		var repository = new dorado.DataTypeRepository(dorado.DataTypeRepository.ROOT);
		repository.loadOptions = {
			url: Test.ROOT + "resource/load-datatype-department.js"
		};
		repository.register("Department");

		Test.asyncProcBegin("AsyncLoad");
		repository.getAsync("Department", function(result) {
			AsyncLoad.dataType = result;
			Test.asyncProcEnd("AsyncLoad");
		});
	},

	run: function() {
		var dataType = this.dataType;
		assertTrue(dataType != null);
		assertEquals("Department", dataType.get("name"));
		assertEquals(4, dataType.get("propertyDefs").size);

		var p = dataType.getPropertyDef("employees");
		assertTrue(p != null);

		dataType = p.get("dataType");
		assertTrue(dataType != null);
		assertEquals("Employees", dataType.get("name"));
	}
};

function testAsyncLoad() {
	AsyncLoad.run();
}

var AsyncComplexDataType = {
	load: function() {
		var repository = this.repository = new dorado.DataTypeRepository();
		repository.loadOptions = {
			url: Test.ROOT + "resource/load-datatype-employee.js"
		};
		repository.register("Employee");

		Test.asyncProcBegin("AsyncComplexDataType");
		repository.getAsync("[Employee]", function(result) {
			AsyncComplexDataType.employees = result;
			Test.asyncProcEnd("AsyncComplexDataType");
		});
	},

	run: function() {
		var employees = this.employees;
		assertTrue(employees instanceof dorado.AggregationDataType);
		assertEquals("[Employee]", employees.get("name"));

		var employee = employees.get("elementDataType");
		assertTrue(employee instanceof dorado.EntityDataType);
		assertEquals("Employee", employee.get("name"));

		var employees2 = this.repository.get("[Employee]");
		assertTrue(employees === employees2);
		assertTrue(employee === employees2.get("elementDataType"));
	}
};

function testAsyncComplexDataType() {
	AsyncComplexDataType.run();
}

var AsyncComplexDataTypeNeverLoad = {
	load: function() {
		var repository = this.repository = new dorado.DataTypeRepository();
		repository.loadOptions = {
			url: Test.ROOT + "resource/load-datatype-employee.js"
		};
		repository.register("Employee");

		Test.asyncProcBegin("AsyncComplexDataTypeNeverLoad");
		repository.getAsync("[Employee]", function(result) {
			AsyncComplexDataTypeNeverLoad.employees = result;
			Test.asyncProcEnd("AsyncComplexDataTypeNeverLoad");
		}, true);
	},

	run: function() {
		var employees = this.employees;
		assertTrue(employees instanceof dorado.AggregationDataType);
		assertEquals("[Employee]", employees.get("name"));
		assertTrue(employees._elementDataType instanceof dorado.LazyLoadDataType);

		var employee = employees.get("elementDataType");
		assertTrue(employee instanceof dorado.EntityDataType);
		assertEquals("Employee", employee.get("name"));
	}
};

function testAsyncComplexDataTypeNeverLoad() {
	AsyncComplexDataTypeNeverLoad.run();
}
