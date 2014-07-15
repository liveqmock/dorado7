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
	Test.preloadAsyncTests( [ GetEntityDataAsync ]);
}

function getData() {
	return Test.getJSON(Test.ROOT + "resource/hr-data.js");
}

var doGetAsync_counter = 0;

TestDataPipe = $extend(dorado.DataPipe, {
	doGet: function() {
		return getData();
	},

	doGetAsync: function(callback) {
		doGetAsync_counter++;
		setTimeout(function() {
			var data = getData();
			$callback(callback, true, data);
		}, 200);
	}
});

var testDataPipe = new TestDataPipe();
testDataPipe.dataType = getDepartmentsDataType();

function testGetEntityData() {
	var data = testDataPipe.get();
	assertNotNull(data);
	assertTrue(data instanceof dorado.EntityList);
	assertTrue(data.entityCount == 2);
	assertEquals("DepartmentsDataType", data.dataType.get("name"));
}

var GetEntityDataAsync = {
	load: function() {
		Test.asyncProcBegin("GetEntityDataAsync1");
		testDataPipe.getAsync(function(data) {
			GetEntityDataAsync.data1 = data;
			Test.asyncProcEnd("GetEntityDataAsync1");
		});

		Test.asyncProcBegin("GetEntityDataAsync2");
		testDataPipe.getAsync(function(data) {
			GetEntityDataAsync.data2 = data;
			Test.asyncProcEnd("GetEntityDataAsync2");
		});
	},

	run: function() {
		var data1 = this.data1;
		var data2 = this.data2;

		assertNotNull(data1);
		assertTrue(data1 instanceof dorado.EntityList);
		assertTrue(data1.entityCount == 2);
		assertEquals("DepartmentsDataType", data1.dataType.get("name"));

		assertTrue(data1 === data2);
		assertEquals(1, doGetAsync_counter);
	}
};

function testGetEntityDataAsync() {
	GetEntityDataAsync.run();
}
