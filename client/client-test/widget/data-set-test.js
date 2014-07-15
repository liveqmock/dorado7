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
	Test.preloadAsyncTests( [ LoadDataAsync ]);
}

function createDataSet() {
	var dataProvider = dorado.DataProvider.create("provider1");
	dataProvider.loadOptions = {
		url: Test.ROOT + "resource/hr-data.js"
	};

	return new dorado.widget.DataSet( {
		dataProvider: dataProvider
	});
}

function testLoadData() {
	var dataSet = createDataSet();
	dataSet.load();
	assertTrue(dataSet.getData() instanceof dorado.EntityList);
}

var LoadDataAsync = {
	dataSet: createDataSet(),

	load: function() {
		Test.asyncProcBegin("GetLoadAsync");
		this.dataSet.loadAsync(function() {
			Test.asyncProcEnd("GetLoadAsync");
		});
	},

	run: function() {
		assertTrue(this.dataSet.getData() instanceof dorado.EntityList);
	}
};

function testLoadDataAsync() {
	LoadDataAsync.run();
}

function testGetDataWithPath() {
	var dataSet = createDataSet();
	dataSet.load();

	var departments = dataSet.getData();
	departments.remove();

	departments.current.set("name", "MODIFIED");

	var department = new dorado.Entity();
	department.set("id", "NEW_ID");
	department.set("name", "NEW_NAME");
	departments.insert(department);

	var dirtyDepartments = dataSet.queryData("[#dirty]");
	assertEquals(dirtyDepartments.length, 3);
	assertEquals(dirtyDepartments[0].state, dorado.Entity.STATE_DELETED);
	assertEquals(dirtyDepartments[1].state, dorado.Entity.STATE_MODIFIED);
	assertEquals(dirtyDepartments[2].state, dorado.Entity.STATE_NEW);
}
