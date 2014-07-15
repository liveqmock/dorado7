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
	Test.preloadAsyncTests( [ GetAsync, GetReference2Async, GetLookup2Async, GetLookup4Async, ParseAndGetTextAsync ]);
}

var p6_pipeCounter = 0;
var p7_pipeCounter = 0;
var reference2_loadCounter = 0;

var dataProvider = dorado.DataProvider.create("provider1");
dataProvider.loadOptions = {
	url: Test.ROOT + "resource/hr-data.js"
};

jQuery.aop.after( {
	target: dataProvider,
	method: "getResultAsync"
}, function(arg, callback) {
	reference2_loadCounter++;
});

function getLooupData() {
	return Test.getJSON(Test.ROOT + "resource/load-lookup-data1.js");
}

function getDoradoLooupData() {
	return new dorado.EntityList(getLooupData());
}

function getEntityDataType() {
	var dataTypeRepository = dorado.DataTypeRepository.ROOT;
	dataTypeRepository.unregister("TestEntity");
	dataTypeRepository.unregister("Department");

	var dataType = new dorado.EntityDataType("TestEntity");
	var p;
	p = new dorado.BasePropertyDef("p1");
	dataType.addPropertyDef(p);

	p = new dorado.BasePropertyDef("p2", dorado.$String);
	dataType.addPropertyDef(p);

	p = new dorado.BasePropertyDef("p3", dorado.$int);
	p.set("displayFormat", "$#,##0.00/DAY");
	dataType.addPropertyDef(p);

	p = new dorado.BasePropertyDef("p4", dorado.$boolean);
	p.set("mapValues", [ {
		key: true,
		value: "Male"
	}, {
		key: false,
		value: "Female"
	} ]);
	dataType.addPropertyDef(p);

	p = new dorado.BasePropertyDef("p5", dorado.$Date);
	p.set("typeFormat", "Y-m-d");
	p.set("displayFormat", "Y-m-d");
	dataType.addPropertyDef(p);

	p = new dorado.BasePropertyDef("p6");
	var pipe1 = new dorado.DataPipe();
	pipe1.property = "p6";
	pipe1.doGet = function() {
		p6_pipeCounter++;
		return "abcdefg" + this.property;
	};
	p.getDataPipe = function() {
		return pipe1;
	};
	dataType.addPropertyDef(p);

	p = new dorado.BasePropertyDef("p7");
	var pipe2 = new dorado.DataPipe();
	pipe2.property = "p7";
	pipe2.doGet = function() {
		p7_pipeCounter++;
		return "abcdefg" + this.property;
	};
	p.getDataPipe = function() {
		return pipe2;
	};
	dataType.addPropertyDef(p);

	p = new dorado.Reference("reference1");
	p.set("dataProvider", dataProvider);
	dataType.addPropertyDef(p);

	dataTypeRepository.register(getDepartmentDataType());
	p = new dorado.Reference("reference2", dataTypeRepository.get("[Department]"));
	p.set("dataProvider", dataProvider);
	dataType.addPropertyDef(p);

	var dataLookupDataProvider = new dorado.DataProvider("dataLookupDataProvider");
	dataLookupDataProvider.getResult = function() {
		return getLooupData();
	};
	dataLookupDataProvider.getResultAsync = function(callback) {
		setTimeout(function() {
			$callback(callback, true, getLooupData());
		}, 0);
	};

	var mockLookupDataSet = {
		id: "mockLookupDataSet",

		getData: function() {
			return getDoradoLooupData();
		},

		getDataAsync: function(callback) {
			setTimeout(function() {
				dorado.Callback.invokeCallback(callback, true, getDoradoLooupData());
			}, 0);
		}
	};

	p = new dorado.BasePropertyDef("lookupKey1", dorado.$int);
	dataType.addPropertyDef(p);

	p = new dorado.Lookup("lookup1");
	p.set("dataProvider", dataLookupDataProvider);
	p.set("constraints", [ {
		lookupKeyProperty: "code",
		keyProperty: "lookupKey1"
	} ]);
	dataType.addPropertyDef(p);

	p = new dorado.Lookup("lookup2");
	p.set("dataProvider", dataLookupDataProvider);
	p.set("constraints", [ {
		lookupKeyProperty: "code",
		keyValue: function() {
			return dorado.$this.get("lookupKey1");
		}
	} ]);
	p.set("lookupProperty", "label");
	dataType.addPropertyDef(p);

	p = new dorado.Lookup("lookup3");
	p.set("dataSet", mockLookupDataSet);
	p.set("constraints", [ {
		lookupKeyProperty: "code",
		keyProperty: "lookupKey1"
	} ]);
	dataType.addPropertyDef(p);

	p = new dorado.Lookup("lookup4");
	p.set("dataSet", mockLookupDataSet);
	p.set("constraints", [ {
		lookupKeyProperty: "code",
		keyValue: function() {
			return dorado.$this.get("lookupKey1");
		}
	} ]);
	p.set("lookupProperty", "label");
	dataType.addPropertyDef(p);

	dataTypeRepository.register(dataType);
	return dataType;
}

function testGetAndSet() {
	p6_pipeCounter = 0;
	p7_pipeCounter = 0;

	var dataType = getEntityDataType();
	var entity = new dorado.Entity( {
		p1: "value1",
		p2: "value2",
		p3: "123",
		p4: "true",
		p5: "1976-04-03"
	}, null, dataType);

	assertEquals("value1", entity.get("p1"));
	assertEquals("value2", entity.get("p2"));
	assertEquals(123, entity.get("p3"));
	assertEquals(true, entity.get("p4"));
	assertTrue(entity.get("p5") instanceof Date);
	assertEquals("abcdefg" + "p6", entity.get("p6"));
	assertEquals("abcdefg" + "p7", entity.get("p7"));

	entity.set("p3", "456");
	assertEquals(456, entity.get("p3"));

	entity.set("p3", "abc");
	assertEquals(0, entity.get("p3"));

	entity.set("p6", "abc");
	assertEquals("abc", entity.get("p6"));

	assertEquals(1, p6_pipeCounter);
	assertEquals(1, p7_pipeCounter);
}

function testState() {
	var dataType = getEntityDataType();
	var entity = new dorado.Entity( {
		p1: "value1",
		p2: "value2",
		p3: "123",
		p4: "true",
		p5: "1976-04-03"
	}, null, dataType);

	assertEquals(dorado.Entity.STATE_NONE, entity.state);
	entity.set("p1", "valueX");
	assertEquals(dorado.Entity.STATE_MODIFIED, entity.state);
	assertEquals("valueX", entity.get("p1"));

	entity.set("p1", "valueX");
	assertEquals(dorado.Entity.STATE_MODIFIED, entity.state);
	assertEquals("valueX", entity.get("p1"));

	entity.reset();
	assertEquals(dorado.Entity.STATE_NONE, entity.state);
	assertEquals("valueX", entity.get("p1"));
}

function testParseAndGetText() {
	var dataType = getEntityDataType();
	var entity = new dorado.Entity(null, null, dataType);

	entity.set("p3", "$123,456,789.789");
	assertEquals(123456790, entity.get("p3"));
	assertEquals("$123,456,790.00/DAY", entity.getText("p3"));

	assertEquals('', entity.getText("p4"));
	entity.set("p4", true);
	assertEquals("Male", entity.getText("p4"));
	entity.set("p4", false);
	assertEquals("Female", entity.getText("p4"));
}

var ParseAndGetTextAsync = {
	load: function() {
		var dataType = getEntityDataType();
		var entity = new dorado.Entity(null, null, dataType);

		entity.set("p3", "$123,456,789.789");

		Test.asyncProcBegin("ParseAndGetTextAsync_p3");
		entity.getTextAsync("p3", function(text) {
			ParseAndGetTextAsync.p3Text = text;
			Test.asyncProcEnd("ParseAndGetTextAsync_p3");
		});

		entity.set("p4", true);

		Test.asyncProcBegin("ParseAndGetTextAsync_p4");
		entity.getTextAsync("p4", function(text) {
			ParseAndGetTextAsync.p4Text = text;
			Test.asyncProcEnd("ParseAndGetTextAsync_p4");
		});
	},

	run: function() {
		assertEquals("$123,456,790.00/DAY", this.p3Text);
		assertEquals("Male", this.p4Text);
	}
};

function testParseAndGetTextAsync() {
	ParseAndGetTextAsync.run();
}

function testParent() {
	var dataType = getEntityDataType();
	var entity = new dorado.Entity(null, null, dataType);

	var subEntity1 = new dorado.Entity();
	var subEntity2 = new dorado.Entity();

	entity.set("p1", subEntity1);
	assertEquals(entity, subEntity1.parent);

	entity.set("p1", subEntity2);
	assertEquals(null, subEntity1.parent);
	assertEquals(entity, subEntity2.parent);
}

function testObserver() {
	var dataType = getEntityDataType();
	var entity = new dorado.Entity(null, null, dataType);

	var dataChanged_counter = 0;
	var stateChanged_counter = 0;
	var refreshEntity_counter = 0;

	var observer = {
		entityMessageReceived: function(messageCode, args) {
			switch (messageCode) {
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

	entity._setObserver(observer);
	assertEquals(observer, entity._observer);

	entity.set("p1", subEntity1); // dataChanged,stateChanged
	assertEquals(observer, subEntity1._observer);
	assertEquals(observer, subEntity2._observer);
	assertEquals(observer, subEntity3._observer);

	subEntity1.set("p", null); // dataChanged
	assertEquals(null, subEntity2._observer);
	assertEquals(null, subEntity3._observer);

	entity.set("p1", null); // dataChanged
	assertEquals(null, subEntity1._observer);

	subEntity1.set("p", subEntity2);
	subEntity2.set("p", null);
	entity.reset(); // stateChanged
	entity.set("p1", subEntity1); // dataChanged,stateChanged
	assertEquals(4, dataChanged_counter);
	assertEquals(3, stateChanged_counter);
	assertEquals(0, refreshEntity_counter);
}

function testEvents() {
	var dataType = getEntityDataType();
	var entity = new dorado.Entity(null, null, dataType);

	var counter = 0;
	dataType.addListener("beforeDataChange", function(sender, arg) {
		assertEquals(dataType, sender);
		assertEquals(entity, arg.entity);
		assertEquals("p1", arg.property);
		assertEquals("value1", arg.newValue);

		arg.newValue = "value2";
		counter += 1;
		assertEquals(1, counter);
	});

	dataType.addListener("onDataChange", function(sender, arg) {
		assertEquals(dataType, sender);
		assertEquals(entity, arg.entity);
		assertEquals("p1", arg.property);
		assertEquals("value2", arg.newValue);
		counter += 10;
		assertEquals(11, counter);
	});

	dataType.addListener("beforeStateChange", function(sender, arg) {
		assertEquals(dataType, sender);
		assertEquals(entity, arg.entity);
		assertEquals(dorado.Entity.STATE_NONE, arg.oldState);
		assertEquals(dorado.Entity.STATE_MODIFIED, arg.newState);
		counter += 100;
		assertEquals(111, counter);
	});

	dataType.addListener("onStateChange", function(sender, arg) {
		assertEquals(dataType, sender);
		assertEquals(entity, arg.entity);
		assertEquals(dorado.Entity.STATE_NONE, arg.oldState);
		assertEquals(dorado.Entity.STATE_MODIFIED, arg.newState);
		counter += 1000;
		assertEquals(1111, counter);
	});

	entity.set("p1", "value1");

	assertEquals("value2", entity.get("p1"));
	assertEquals(1111, counter);
}

function testToJSON1() {
	var dataType = getEntityDataType();
	var entity = new dorado.Entity( {
		p1: "value1",
		p2: "value2",
		p3: "123",
		p4: "true",
		p5: "1976-04-03"
	}, null, dataType);

	var json = entity.toJSON();
	assertTrue(typeof json.p3 == "number");
	assertTrue(typeof json.p4 == "boolean");
	assertTrue(json.p5 instanceof Date);
}

function testToJSON2() {
	var dataType = getEntityDataType();
	var entity = new dorado.Entity( {
		p1: "value1",
		p2: "value2",
		p3: "123",
		p4: "true",
		p5: "1976-04-03"
	}, null, dataType);

	var options = {
		generateDataType: true,
		generateState: true
	};
	var json = entity.toJSON(options);
	assertEquals(typeof json.p3, "number");
	assertEquals(typeof json.p4, "boolean");
	assertTrue(json.p5 instanceof Date);
	assertEquals(json.$dataType, "TestEntity");
	assertEquals(json.$state, undefined);

	entity.set("p3", 456);
	json = entity.toJSON(options);
	assertEquals(json.p3, 456);
	assertEquals(json.$dataType, "TestEntity");
	assertEquals(json.$state, dorado.Entity.STATE_MODIFIED);
}

var GetAsync = {
	load: function() {
		var dataType = getEntityDataType();
		var entity = new dorado.Entity(null, null, dataType);
		entity.set("p1", "value1");

		Test.asyncProcBegin("GetAsync");
		this.returnValue = entity.getAsync("p1", function(value) {
			GetAsync.asyncReturnValue = value;
			Test.asyncProcEnd("GetAsync");
		});
	},

	run: function() {
		assertEquals("value1", this.asyncReturnValue);
		assertTrue(undefined === this.returnValue);
	}
};

function testGetAsync() {
	GetAsync.run();
}

function testGetReference1() {
	var dataType = getEntityDataType();
	var entity = new dorado.Entity(null, null, dataType);
	var reference = entity.get("reference1");

	assertNotNull(reference);
	assertTrue(reference instanceof Array);
	assertEquals(2, reference.length);
}

function testGetReference2() {
	var dataType = getEntityDataType();
	var entity = new dorado.Entity(null, null, dataType);
	var reference1 = entity.get("reference2");
	var reference2 = entity.get("reference2");

	assertNotNull(reference1);
	assertTrue(reference1 instanceof dorado.EntityList);
	assertEquals(2, reference1.entityCount);

	assertTrue(reference1 === reference2);
}

var GetReference2Async = {
	load: function() {
		var dataType = getEntityDataType();
		var entity = new dorado.Entity(null, null, dataType);

		Test.asyncProcBegin("GetReference2Async-1");
		entity.getAsync("reference2", function(reference) {
			GetReference2Async.reference1 = reference;
			Test.asyncProcEnd("GetReference2Async-1");
		});

		Test.asyncProcBegin("GetReference2Async-2");
		entity.getAsync("reference2", function(reference) {
			GetReference2Async.reference2 = reference;
			Test.asyncProcEnd("GetReference2Async-2");
			GetReference2Async.reference3 = entity.get("reference2");
		});
	},

	run: function() {
		var reference1 = this.reference1;
		var reference2 = this.reference2;
		var reference3 = this.reference3;

		assertNotNull(reference1);
		assertTrue(reference1 instanceof dorado.EntityList);
		assertEquals(2, reference1.entityCount);

		assertTrue(reference1 === reference2);
		assertTrue(reference2 === reference3);
	}
};

function testGetReference2Async() {
	GetReference2Async.run();
}

function testDataPipeMultiCallbacks() {
	assertEquals(1, reference2_loadCounter);
}

function testGetLookup1() {
	var dataType = getEntityDataType();
	var entity = new dorado.Entity(null, null, dataType);
	var lookupResult;

	lookupResult = entity.get("lookup1");
	assertTrue(lookupResult === undefined);

	entity.set("lookupKey1", 2);
	lookupResult = entity.get("lookup1");
	assertNotNull(lookupResult);
	assertEquals(2, lookupResult.get("code"));
	assertEquals("Shanghai", lookupResult.get("label"));

	entity.set("lookupKey1", 4);
	lookupResult = entity.get("lookup1");
	assertNotNull(lookupResult);
	assertEquals(4, lookupResult.get("code"));
	assertEquals("Chongqing", lookupResult.get("label"));
}

function testGetLookup2() {
	var dataType = getEntityDataType();
	var entity = new dorado.Entity(null, null, dataType);
	var lookupResult;

	lookupResult = entity.get("lookup2");
	assertTrue(lookupResult === undefined);

	entity.set("lookupKey1", 2);
	lookupResult = entity.get("lookup2");
	assertNotNull(lookupResult);
	assertEquals("Shanghai", lookupResult);

	entity.set("lookupKey1", 4);
	lookupResult = entity.get("lookup2");
	assertNotNull(lookupResult);
	assertEquals("Chongqing", lookupResult);
}

var GetLookup2Async = {
	load: function() {
		var dataType = getEntityDataType();
		var entity = new dorado.Entity(null, null, dataType);
		entity.set("lookupKey1", 2);

		Test.asyncProcBegin("GetLookup2Async");
		entity.getAsync("lookup2", function(lookupResult) {
			GetLookup2Async.lookupResult = lookupResult;
			Test.asyncProcEnd("GetLookup2Async");
		});
	},

	run: function() {
		var lookupResult = this.lookupResult;
		assertNotNull(lookupResult);
		assertEquals("Shanghai", lookupResult);
	}
};

function testGetLookup4Async() {
	GetLookup4Async.run();
}

function _testGetLookup2_performance() {
	var dataType = getEntityDataType();
	var entity = new dorado.Entity(null, null, dataType);
	entity.set("lookupKey1", 2);
	var lookupResult;

	var s = new Date();
	for ( var i = 0; i < 5000; i++) {
		lookupResult = entity.get("lookup2");
	}
	alert(new Date - s);
}

function testGetLookup3() {
	var dataType = getEntityDataType();
	var entity = new dorado.Entity(null, null, dataType);
	var lookupResult;

	lookupResult = entity.get("lookup3");
	assertTrue(lookupResult === undefined);

	entity.set("lookupKey1", 2);
	lookupResult = entity.get("lookup3");
	assertNotNull(lookupResult);
	assertEquals(2, lookupResult.get("code"));
	assertEquals("Shanghai", lookupResult.get("label"));

	entity.set("lookupKey1", 4);
	lookupResult = entity.get("lookup3");
	assertNotNull(lookupResult);
	assertEquals(4, lookupResult.get("code"));
	assertEquals("Chongqing", lookupResult.get("label"));
}

function testGetLookup4() {
	var dataType = getEntityDataType();
	var entity = new dorado.Entity(null, null, dataType);
	var lookupResult;

	lookupResult = entity.get("lookup4");
	assertTrue(lookupResult === undefined);

	entity.set("lookupKey1", 2);
	lookupResult = entity.get("lookup4");
	assertNotNull(lookupResult);
	assertEquals("Shanghai", lookupResult);

	entity.set("lookupKey1", 4);
	lookupResult = entity.get("lookup4");
	assertNotNull(lookupResult);
	assertEquals("Chongqing", lookupResult);
}

var GetLookup4Async = {
	load: function() {
		var dataType = getEntityDataType();
		var entity = new dorado.Entity(null, null, dataType);
		entity.set("lookupKey1", 2);

		Test.asyncProcBegin("GetLookup4Async");
		entity.getAsync("lookup4", function(lookupResult) {
			GetLookup4Async.lookupResult = lookupResult;
			Test.asyncProcEnd("GetLookup4Async");
		});
	},

	run: function() {
		var lookupResult = this.lookupResult;
		assertNotNull(lookupResult);
		assertEquals("Shanghai", lookupResult);
	}
};

function testGetLookup4Async() {
	GetLookup4Async.run();
}
