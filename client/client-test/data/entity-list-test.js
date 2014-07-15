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

function createEntityDataType() {
	var dataType = new dorado.EntityDataType("TestEntity");
	for (var i = 0; i < 5; i++) {
		var p = new dorado.BasePropertyDef("p" + i);
		p.label = "label" + i;
		dataType.addPropertyDef(p);
	}
	return dataType;
}

function createAggregationDataType(elementDataType) {
	var dataType = new dorado.AggregationDataType("TestEntities", elementDataType);
	return dataType;
}

function createEntity(elementDataType, prefix) {
	return new dorado.Entity({
		p1: prefix + 1,
		p2: prefix + 2,
		p3: prefix + 3
	}, null, elementDataType);
}

function createEntityList() {
	var elementDataType = createEntityDataType();
	var dataType = createAggregationDataType(elementDataType);
	var entityList = new dorado.EntityList(null, null, dataType);
	var entities = [];
	for (var i = 0; i < 10; i++) {
		var entity = createEntity(elementDataType, i + ".");
		entities.push(entity);
		entityList.insert(entity);
	}
	return [entityList, entities];
}

function testBaseFunctions() {
	var result = createEntityList();
	var entityList = result[0];
	var entities = result[1];
	
	assertEquals(10, entityList.entityCount);
	assertEquals(entities[entities.length - 1], entityList.current);
	
	entityList.setCurrent(entities[4]);
	assertEquals(entities[4], entityList.current);
	
	entityList.remove();
	assertEquals(9, entityList.entityCount);
	assertEquals(entities[5], entityList.current);
	
	entityList.remove(entities[5]);
	assertEquals(8, entityList.entityCount);
	assertEquals(entities[6], entityList.current);
	
	entityList.remove(entities[7]);
	assertEquals(7, entityList.entityCount);
	assertEquals(entities[6], entityList.current);
}

function testMoveCurrent() {
	var result = createEntityList();
	var entityList = result[0];
	var entities = result[1];
	
	entityList.first();
	assertEquals(entities[0], entityList.current);
	
	entityList.next();
	assertEquals(entities[1], entityList.current);
	
	entityList.previous();
	assertEquals(entities[0], entityList.current);
	
	entityList.previous();
	assertEquals(entities[0], entityList.current);
	
	entityList.last();
	assertEquals(entities[9], entityList.current);
}

function testEach() {
	var result = createEntityList();
	var entityList = result[0];
	var entities = result[1];
	
	var i = 0;
	entityList.each(function() {
		assertEquals(entities[i], this);
		i++;
	});
	assertEquals(10, i);
}

function testEntityFromJSON1() {
	var data = Test.getJSON(Test.ROOT + "resource/hr-data.js");
	var root = new dorado.Entity(data[0], null, getDepartmentDataType());
	
	assertEquals("D1", root.get("id"));
	var departments = root.get("departments");
	assertTrue(departments instanceof dorado.EntityList);
	assertEquals(2, departments.entityCount);
	
	var department = departments.current;
	assertEquals("D11", department.get("id"));
	
	departments.next();
	department = departments.current;
	assertEquals("D12", department.get("id"));
	
	var employees = department.get("employees");
	assertTrue(employees instanceof dorado.EntityList);
	assertEquals(2, employees.entityCount);
	
	var employee = employees.current;
	assertEquals("0004", employee.get("id"));
	
	var count = 0;
	employees.each(function() {
		assertTrue(this instanceof dorado.Entity);
		count++;
	});
	assertEquals(2, count);
}

function testEntityFromJSON2() {
	var data = Test.getJSON(Test.ROOT + "resource/hr-data.js");
	var departments = new dorado.EntityList(data, null, getDepartmentsDataType());
	
	var department = departments.current;
	assertEquals("D1", department.get("id"));
	
	var count = 0;
	departments.each(function() {
		assertTrue(this instanceof dorado.Entity);
		count++;
	});
	assertEquals(2, count);
	
	var it = departments.iterator();
	while (it.hasNext()) {
		department = it.next();
		assertTrue(department instanceof dorado.Entity);
		assertTrue(department.get("departments") instanceof dorado.EntityList);
	}
}

function testParent() {
	var result = createEntityList();
	var entityList = result[0];
	
	var subEntity1 = new dorado.Entity();
	var subEntity2 = new dorado.Entity();
	
	entityList.insert(subEntity1);
	assertEquals(entityList, subEntity1.parent);
	
	entityList.remove(subEntity1, true);
	entityList.insert(subEntity2);
	assertEquals(null, subEntity1.parent);
	assertEquals(entityList, subEntity2.parent);
}

function testObserver() {
	var data = Test.getJSON(Test.ROOT + "resource/hr-data.js");
	var departments = new dorado.EntityList(data, null, getDepartmentsDataType());
	
	var currentChanged_counter = 0;
	var deleted_counter = 0;
	var inserted_counter = 0;
	var dataChanged_counter = 0;
	var stateChanged_counter = 0;
	var refreshEntity_counter = 0;
	
	var observer = {
		entityMessageReceived: function(messageCode, args) {
			switch (messageCode) {
				case dorado.EntityList._MESSAGE_CURRENT_CHANGED:
					currentChanged_counter++;
					break;
				case dorado.EntityList._MESSAGE_DELETED:
					deleted_counter++;
					break;
				case dorado.EntityList._MESSAGE_INSERTED:
					inserted_counter++;
					break;
				case dorado.Entity._MESSAGE_DATA_CHANGED:
					dataChanged_counter++;
					break;
				case dorado.Entity._MESSAGE_ENTITY_STATE_CHANGED:
					stateChanged_counter++;
					break;
				case dorado.Entity._MESSAGE_REFRESH_ENTITY:
					refreshEntity_counter++;
					break;
			}
		}
	};
	
	var subEntity1 = new dorado.Entity();
	var subEntity2 = new dorado.Entity();
	var subEntity3 = new dorado.Entity();
	
	subEntity1.set("p", subEntity2);
	subEntity2.set("p", subEntity3);
	
	departments._setObserver(observer);
	assertEquals(observer, departments._observer);
	
	assertEquals(0, currentChanged_counter);
	assertEquals(0, deleted_counter);
	assertEquals(0, inserted_counter);
	assertEquals(0, dataChanged_counter);
	assertEquals(0, stateChanged_counter);
	assertEquals(0, refreshEntity_counter);
	
	departments.insert(subEntity1); // inserted,currentChanged,stateChanged
	assertEquals(observer, subEntity1._observer);
	assertEquals(observer, subEntity2._observer);
	assertEquals(observer, subEntity3._observer);
	
	subEntity1.reset(); // stateChanged
	subEntity1.set("p", null); // dataChanged,stateChanged
	assertEquals(null, subEntity2._observer);
	assertEquals(null, subEntity3._observer);
	
	departments.remove(subEntity1, true); // deleted,currentChanged,stateChanged
	assertEquals(null, subEntity1._observer);
	
	subEntity1.set("p", subEntity2);
	subEntity2.set("p", null);
	departments.first(); // currentChanged
	departments.next(); // currentChanged
	departments.previous(); // currentChanged
	departments.previous();
	
	assertEquals(5, currentChanged_counter);
	assertEquals(1, deleted_counter);
	assertEquals(1, inserted_counter);
	assertEquals(1, dataChanged_counter);
	assertEquals(4, stateChanged_counter);
	assertEquals(0, refreshEntity_counter);
}

function testEvents() {
	var data = Test.getJSON(Test.ROOT + "resource/hr-data.js");
	var results = getDepartmentDataTypes();
	var departmentDataType = results[0];
	var departmentsDataType = results[1];
	var departments = new dorado.EntityList(data, null, departmentsDataType);
	
	var counter1 = counter2 = 0;
	departmentDataType.addListener("beforeInsert", function(sender, arg) {
		assertEquals(departmentDataType, sender);
		assertEquals(newDepartment, arg.entity);
		assertEquals(departments, arg.entityList);
		counter1 += 1;
		assertEquals(1, counter1);
	});
	
	departmentDataType.addListener("onInsert", function(sender, arg) {
		assertEquals(departmentDataType, sender);
		assertEquals(newDepartment, arg.entity);
		assertEquals(departments, arg.entityList);
		counter1 += 10;
		assertEquals(11, counter1);
	});
	
	departmentDataType.addListener("beforeRemove", function(sender, arg) {
		assertEquals(departmentDataType, sender);
		assertEquals(newDepartment, arg.entity);
		assertEquals(departments, arg.entityList);
		counter1 += 100;
		assertEquals(111, counter1);
	});
	
	departmentDataType.addListener("onRemove", function(sender, arg) {
		assertEquals(departmentDataType, sender);
		assertEquals(newDepartment, arg.entity);
		assertEquals(departments, arg.entityList);
		counter1 += 1000;
		assertEquals(1111, counter1);
	});
	
	departmentDataType.addListener("beforeCurrentChange", function(sender, arg) {
		assertEquals(departmentDataType, sender);
		assertEquals(departments, arg.entityList);
		counter2 += 1;
	});
	
	departmentDataType.addListener("onCurrentChange", function(sender, arg) {
		assertEquals(departmentDataType, sender);
		assertEquals(departments, arg.entityList);
		counter2 += 10;
	});
	
	var newDepartment = new dorado.Entity(null, null, departmentDataType);
	
	departments.insert(newDepartment);
	assertEquals(dorado.Entity.STATE_NEW, newDepartment.state);
	
	departments.setCurrent(newDepartment);
	
	departments.remove(newDepartment);
	assertEquals(dorado.Entity.STATE_DELETED, newDepartment.state);
	
	assertEquals(1111, counter1);
	assertEquals(22, counter2);
}

function testToJSON1() {
	var data = Test.getJSON(Test.ROOT + "resource/hr-data.js");
	var departments = new dorado.EntityList(data, null, getDepartmentsDataType());
	var json = departments.toJSON();
	assertEquals(json.length, 2);
	assertEquals(json[0].departments.length, 2);
}

function testToJSON2() {
	var data = Test.getJSON(Test.ROOT + "resource/hr-data.js");
	var departments = new dorado.EntityList(data, null, getDepartmentsDataType());
	var json;
	var options = {
		generateDataType: true,
		generateState: true
	};
	
	departments.current.set("name", "MODIFIED");
	
	json = departments.toJSON(options);
	assertEquals(json.length, 2);
	assertEquals(json[0].departments.length, 2);
	assertEquals(json[0].name, "MODIFIED");
	assertEquals(json[0].$dataType, "DepartmentDataType");
	assertEquals(json[0].$state, dorado.Entity.STATE_MODIFIED);
	
	assertEquals(json[1].$dataType, undefined);
	assertEquals(json[1].$state, undefined);
	
	options.properties = ["id", "name"];
	json = departments.toJSON(options);
	assertEquals(json.length, 2);
	assertEquals(json[0].departments, undefined);
}

function testPage1() {
	var deparmentsDataType = getDepartmentsDataType();
	var dataProvider = dorado.DataProvider.create();
	dataProvider.loadOptions = {
		uri: Test.ROOT + "resource/hr-data.js"
	};
	
	var departments = new dorado.EntityList(null, null, deparmentsDataType);
	departments.dataProvider = dataProvider;
	departments.pageSize = 2;
	departments.pageCount = 12;
	
	departments.gotoPage(1);
	assertEquals(2, departments.entityCount);
	
	departments.current.set("id", "#D1");
	departments.next();
	departments.gotoPage(1);
	assertEquals(2, departments.entityCount);
	assertEquals("#D1", departments.current.get("id"));
	
	departments.gotoPage(2);
	assertEquals(4, departments.entityCount);
	departments.current.set("id", "#D3");
	
	departments.gotoPage(1);
	assertEquals("#D1", departments.current.get("id"));
	
	departments.gotoPage(2);
	assertEquals("#D3", departments.current.get("id"));
}

function testPage2() {
	var deparmentsDataType = getDepartmentsDataType();
	var dataProvider = dorado.DataProvider.create();
	dataProvider.loadOptions = {
		uri: Test.ROOT + "resource/hr-data.js"
	};
	
	var departments = new dorado.EntityList(null, null, deparmentsDataType);
	departments.dataProvider = dataProvider;
	departments.pageSize = 2;
	departments.pageCount = 12;
	departments.gotoPage(2);
	
	var counter = 0;
	departments.each(function(entity) {
		counter++;
	});
	assertEquals(2, counter);
	
	departments.gotoPage(5);
	counter = 0;
	var it = departments.iterator();
	while (it.hasNext()) {
		var entity = it.next();
		counter++;
	}
	assertEquals(4, counter);
	
	counter = 0;
	var it = departments.iterator({
		includeUnloadPage: true
	});
	while (it.hasNext()) {
		var entity = it.next();
		counter++;
	}
	assertEquals(24, counter);
}

function testIterator() {
	var deparmentsDataType = getDepartmentsDataType();
	var dataProvider = dorado.DataProvider.create();
	dataProvider.loadOptions = {
		uri: Test.ROOT + "resource/hr-data.js"
	};
	
	var departments = new dorado.EntityList(null, null, deparmentsDataType);
	departments.dataProvider = dataProvider;
	departments.pageSize = 2;
	departments.pageCount = 12;
	departments.gotoPage(4);
	
	var counter1 = counter2 = 0, it;
	
	it = departments.iterator({
		simulateUnloadPage: true
	});
	while (it.hasNext()) {
		var entity = it.next();
		if (entity === dorado.Entity.NULL_OBJECT) counter2++;
		counter1++;
	}
	assertEquals(24, counter1);
	assertEquals(22, counter2);
	
	counter1 = counter2 = 0;
	it = departments.iterator({
		simulateUnloadPage: true
	});
	it.last();
	
	while (it.hasPrevious()) {
		var entity = it.previous();
		if (entity === dorado.Entity.NULL_OBJECT) counter2++;
		counter1++;
	}
	assertEquals(24, counter1);
	assertEquals(22, counter2);
	
	counter1 = counter2 = 0;
	it = departments.iterator({
		pageNo: 5
	});
	while (it.hasNext()) {
		var entity = it.next();
		counter1++;
	}
	assertEquals(0, counter1);
	
	counter1 = counter2 = 0;
	it = departments.iterator({
		simulateUnloadPage: true,
		pageNo: 5
	});
	while (it.hasNext()) {
		var entity = it.next();
		counter1++;
	}
	assertEquals(2, counter1);

	counter1 = counter2 = 0;
	var it = departments.iterator({
		simulateUnloadPage: true,
		nextIndex: 5
	});
	while (it.hasNext()) {
		var entity = it.next();
		if (entity === dorado.Entity.NULL_OBJECT) counter2++;
		counter1++;
	}
	assertEquals(19, counter1);
	assertEquals(17, counter2);
}

function testClear() {
	var deparmentsDataType = getDepartmentsDataType();
	var dataProvider = dorado.DataProvider.create();
	dataProvider.loadOptions = {
		uri: Test.ROOT + "resource/hr-data.js"
	};
	
	var departments = new dorado.EntityList(null, null, deparmentsDataType);
	departments.dataProvider = dataProvider;
	departments.pageSize = 2;
	departments.pageCount = 12;
	departments.gotoPage(2);
	departments.gotoPage(5);
	
	assertEquals(4, departments.entityCount);
	departments.clear();
	assertEquals(0, departments.entityCount);
	departments.gotoPage(4);
	departments.gotoPage(3);
	assertEquals(4, departments.entityCount);
}

function testFlush() {
	var deparmentsDataType = getDepartmentsDataType();
	var dataProvider = dorado.DataProvider.create();
	dataProvider.loadOptions = {
		uri: Test.ROOT + "resource/hr-data.js"
	};
	
	var departments = new dorado.EntityList(null, null, deparmentsDataType);
	departments.dataProvider = dataProvider;
	departments.pageSize = 2;
	departments.pageCount = 12;
	departments.gotoPage(2);
	departments.gotoPage(5);
	
	assertEquals(4, departments.entityCount);
	departments.flush();
	assertEquals(2, departments.entityCount);
}
