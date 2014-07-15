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
	Test.preloadAsyncTests([GetResultAsync, GetDataAndDataTypeAsync]);
}

function testGetResult() {
	var dataProvider = dorado.DataProvider.create("provider1");
	dataProvider.loadOptions = {
		url: Test.ROOT + "resource/hr-data.js"
	};
	var data = dataProvider.getResult();
	assertNotNull(data);
	assertTrue(data instanceof Array);
	assertEquals(2, data.length);
	
	dataProvider2 = dorado.DataProvider.create("provider1");
	assertTrue(dataProvider == dataProvider2);
}

var GetResultAsync = {
	load: function() {
		var dataProvider = dorado.DataProvider.create();
		dataProvider.loadOptions = {
			url: Test.ROOT + "resource/hr-data.js"
		};
		
		Test.asyncProcBegin("GetResultAsync");
		dataProvider.getResultAsync(null, function(data) {
			GetResultAsync.data = data;
			Test.asyncProcEnd("GetResultAsync");
		});
	},
	
	run: function() {
		var data = this.data;
		assertNotNull(data);
		assertTrue(data instanceof Array);
		assertEquals(2, data.length);
	}
};

function testGetResultAsync() {
	GetResultAsync.run();
}

TestDataProviderPipe = $extend(dorado.DataProviderPipe, {
	constructor: function(dataProvider, dataTypeRepository, dataType) {
		this.dataProvider = dataProvider;
		this.dataTypeRepository = dataTypeRepository;
		this.dataType = dataType;
	},
	
	getDataProviderArg: function(arg) {
		return {};
	}
});

function testGetDataAndDataType() {
	var repository = new dorado.DataTypeRepository();
	dataType = repository.get("[Department]", true);
	
	var dataProvider = dorado.DataProvider.create("providerGetDataAndDataType");
	dataProvider.loadOptions = {
		url: Test.ROOT + "resource/load-data-and-datatype.js"
	};
	
	var pipe = new TestDataProviderPipe(dataProvider, repository, dataType);
	var data = pipe.get();
	
	assertNotNull(data);
	dataType = repository.get("[Department]", true);
	
	var elementDataType = dataType.get("elementDataType");
	assertTrue(elementDataType instanceof dorado.EntityDataType);
	assertEquals("Department", elementDataType.get("name"));
	
	assertTrue(elementDataType === repository.get("Department", true));
}

var GetDataAndDataTypeAsync = {
	load: function() {
		var repository = new dorado.DataTypeRepository();
		this.repository = repository;
		dataType = repository.get("[Department]", true);
		
		var dataProvider = dorado.DataProvider.create("providerGetDataAndDataType");
		dataProvider.loadOptions = {
			url: Test.ROOT + "resource/load-data-and-datatype.js"
		};
		
		var pipe = new TestDataProviderPipe(dataProvider, repository, dataType);
		pipe.getAsync(function(data) {
			repository.data = data;
		});
	},
	
	run: function() {
		var repository = this.repository;
		var data = this.data;
		
		assertNotNull(data);
		dataType = repository.get("[Department]", true);
		
		var elementDataType = dataType.get("elementDataType");
		assertTrue(elementDataType instanceof dorado.EntityDataType);
		assertEquals("Department", elementDataType.get("name"));
		
		assertTrue(elementDataType === repository.get("Department", true));
	}
};

function testGetDataAndDataTypeAsync() {
	GetDataAndDataTypeAsync.run();
}
