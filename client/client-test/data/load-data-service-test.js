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

function testBrichService() {
	var options = {
		url: Test.CONTEXT_PATH + "/dorado/client-service",
		jsonData: {
			action: "LoadData",
			dataProvider: "testProvider1",
			parameter: null,
			pageSize: null,
			pageNo: null,
			supportDataTypeDefinitions: null,
			requiredDataTypes: null
		}
	};
	var result = $ajax.requestSync(options);
	var data = result.getJsonData();

	assertNotNull(data);
	assertEquals(3, data.length);
	assertEquals("A1", data[0].key1);
	assertEquals("A2", data[0].key2);
	assertEquals("B1", data[1].key1);
	assertEquals("B3", data[1].key3);
}

function testBrichServiceParameter() {
	var options = {
		url: Test.CONTEXT_PATH + "/dorado/client-service",
		jsonData: {
			action: "LoadData",
			dataProvider: "testProvider1",
			parameter: null,
			pageSize: null,
			pageNo: null,
			supportDataTypeDefinitions: true,
			requiredDataTypes: null
		}
	};
	var result = $ajax.requestSync(options);
	var responseData = result.getJsonData();
	var data = responseData.data;
	var dataTypes = responseData.$dataTypeDefinitions;

	assertNotNull(data);
	assertEquals(3, data.length);
	assertEquals("A1", data[0].key1);
	assertEquals("A2", data[0].key2);
	assertEquals("B1", data[1].key1);
	assertEquals("B3", data[1].key3);

	assertNotNull(dataTypes);
	assertEquals(2, dataTypes.length);
}

function testBrichServiceRequiredDataTypes() {
	var options = {
		url: Test.CONTEXT_PATH + "/dorado/client-service",
		jsonData: {
			action: "LoadData",
			dataProvider: "testProvider1",
			parameter: null,
			pageSize: null,
			pageNo: null,
			supportDataTypeDefinitions: true,
			includeDataTypes: [ "[test.Manager]", "map.Employee" ]
		}
	};
	var result = $ajax.requestSync(options);
	var responseData = result.getJsonData();
	var data = responseData.data;
	var dataTypes = responseData.$dataTypeDefinitions;

	assertNotNull(data);
	assertEquals(3, data.length);
	assertEquals("A1", data[0].key1);
	assertEquals("A2", data[0].key2);
	assertEquals("B1", data[1].key1);
	assertEquals("B3", data[1].key3);

	assertNotNull(dataTypes);
	assertEquals(5, dataTypes.length);
}

function testBrichServicePaging() {
	var options = {
		url: Test.CONTEXT_PATH + "/dorado/client-service",
		jsonData: {
			action: "LoadData",
			dataProvider: "providerPagingData1",
			parameter: "Entity",
			pageSize: 10,
			pageNo: 1,
			supportDataTypeDefinitions: false,
			requiredDataTypes: null
		}
	};
	var result = $ajax.requestSync(options);
	var data = result.getJsonData();

	assertNotNull(data);
	assertEquals(10, data.length);
	assertEquals("Entity-1", data[0].key);
	assertEquals("Entity-6", data[5].key);

	options = {
		url: Test.CONTEXT_PATH + "/dorado/client-service",
		jsonData: {
			action: "LoadData",
			dataProvider: "providerPagingData1",
			parameter: "Entity",
			pageSize: 10,
			pageNo: 8,
			supportDataTypeDefinitions: false,
			requiredDataTypes: null
		}
	};
	result = $ajax.requestSync(options);
	data = result.getJsonData();

	assertNotNull(data);
	assertEquals(10, data.length);
	assertEquals("Entity-71", data[0].key);
	assertEquals("Entity-76", data[5].key);
}

function testBrichServiceException() {
	var options = {
		url: Test.CONTEXT_PATH + "/dorado/client-service",
		jsonData: {
			action: "LoadData",
			dataProvider: "invalidProvider",
			parameter: null,
			pageSize: null,
			pageNo: null,
			supportDataTypeDefinitions: true,
			requiredDataTypes: null
		}
	};
	var result = $ajax.requestSync(options);
	assertFalse(result.success);
	if (!result.success) dorado.Exception.removeException(result.error);
}
