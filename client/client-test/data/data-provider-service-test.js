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

function testDataProvider() {
	var provider = dorado.DataProvider.create("testProvider1");
	var data = provider.getResult();

	assertNotNull(data);
	assertEquals(3, data.length);
	assertEquals("A1", data[0].key1);
	assertEquals("A2", data[0].key2);
	assertEquals("B1", data[1].key1);
	assertEquals("B3", data[1].key3);
}

function testDataProviderPaging() {
	var provider = dorado.DataProvider.create("providerPagingData1");
	var data = provider.getResult( {
		parameter: "Record",
		pageSize: 10,
		pageNo: 1,
		dataTypeOptions: {
			supportDataTypeDefinitions: false
		}
	});
	data = data.data || data;

	assertNotNull(data);
	assertEquals(10, data.pageSize);
	assertEquals("Record-1", data[0].key);
	assertEquals("Record-6", data[5].key);

	data = provider.getResult( {
		parameter: "Record",
		pageSize: 10,
		pageNo: 8,
		dataTypeOptions: {
			supportDataTypeDefinitions: false
		}
	});
	data = data.data || data;

	assertNotNull(data);
	assertEquals(10, data.pageSize);
	assertEquals(11, data.pageCount);
	assertEquals(108, data.entityCount);
	assertEquals("Record-71", data[0].key);
	assertEquals("Record-76", data[5].key);
}

TestDataProviderPipe = $extend(dorado.DataProviderPipe, {
	constructor: function(dataProvider, dataTypeRepository, dataType) {
		this.dataProvider = dataProvider;
		this.dataTypeRepository = dataTypeRepository;
		this.dataType = dataType;
	},

	getDataProviderArg: function() {
		return this.dataProviderArg;
	}
});

function testDataProviderPagingPipe() {
	var provider = dorado.DataProvider.create("providerPagingData1");
	var pipe = new TestDataProviderPipe(provider, dorado.DataTypeRepository.ROOT, null);
	pipe.dataProviderArg = {
		parameter: "Record",
		pageSize: 10,
		pageNo: 8
	};
	var data = pipe.get();

	assertNotNull(data);
	assertEquals(10, data.length);
	assertEquals(11, data.pageCount);
	assertEquals(108, data.entityCount);
	assertEquals("Record-71", data[0].key);
	assertEquals("Record-76", data[5].key);
}
