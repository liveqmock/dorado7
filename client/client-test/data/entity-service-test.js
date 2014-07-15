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

function getEntityDataType() {
	var dataType = new dorado.EntityDataType("TestEntity");

	var p;
	p = new dorado.BasePropertyDef("p1");
	dataType.addPropertyDef(p);

	p = new dorado.Reference("reference1");
	p.set( {
		dataProvider: dorado.DataProvider.create("providerTestReference1"),
		parameter: function() {
			return dorado.$this;
		}
	});
	dataType.addPropertyDef(p);

	// reference
	p = new dorado.Reference("reference2", new dorado.EntityDataType( {
		name: "DataTypeReference2",
		acceptUnknownProperty: true
	}));
	p.set( {
		dataProvider: dorado.DataProvider.create("providerTestReference1"),
		parameter: function() {
			return dorado.$this;
		}
	});
	dataType.addPropertyDef(p);

	p = new dorado.Reference("reference3");
	p.set( {
		dataProvider: dorado.DataProvider.create("providerTestReference2"),
		pageSize: 10,
		parameter: function() {
			return dorado.$this;
		}
	});
	dataType.addPropertyDef(p);

	p = new dorado.Reference("reference4", new dorado.AggregationDataType("DataTypeReference4"));
	p.set( {
		dataProvider: dorado.DataProvider.create("providerTestReference2"),
		pageSize: 10,
		parameter: function() {
			return dorado.$this;
		}
	});
	dataType.addPropertyDef(p);

	// lookup
	p = new dorado.BasePropertyDef("p2");
	dataType.addPropertyDef(p);

	p = new dorado.Lookup("lookup1");
	p.set( {
		dataProvider: dorado.DataProvider.create("providerTestLookup1"),
		lookupProperty: "value",
		constraints: [ {
			lookupKeyProperty: "key",
			keyProperty: "p2"
		} ]
	});
	dataType.addPropertyDef(p);

	return dataType;
}

function testReference1() {
	var dataType = getEntityDataType();
	var entity = new dorado.Entity( {
		p1: "value1"
	}, null, dataType);

	var reference = entity.get("reference1");
	assertNotNull(reference);
	assertEquals("value1", reference.p1);
	assertEquals("Hello Reference Reader.", reference.fromServer);
}

function testReference2() {
	var dataType = getEntityDataType();
	var entity = new dorado.Entity( {
		p1: "value1"
	}, null, dataType);

	var reference = entity.get("reference2");
	assertNotNull(reference);
	assertEquals("value1", reference.get("p1"));
	assertEquals("Hello Reference Reader.", reference.get("fromServer"));
}

function testReference3() {
	var dataType = getEntityDataType();
	var entity = new dorado.Entity( {
		p1: "value1"
	}, null, dataType);

	var reference = entity.get("reference3");
	assertNotNull(reference);
	assertTrue(reference instanceof Array);
	assertEquals(10, reference.length);
}

function testReference4() {
	var dataType = getEntityDataType();
	var entity = new dorado.Entity( {
		p1: "value1"
	}, null, dataType);

	var reference = entity.get("reference4");
	assertNotNull(reference);
	assertTrue(reference instanceof dorado.EntityList);
	assertEquals(108, reference.entityCount);
	assertEquals(11, reference.pageCount);

	reference.gotoPage(2);
	assertEquals(108, reference.entityCount);
	assertEquals(11, reference.pageCount);
	assertEquals(2, reference.pageNo);

	reference.gotoPage(5);
	assertEquals(108, reference.entityCount);
	assertEquals(11, reference.pageCount);
	assertEquals(5, reference.pageNo);

	var i = 0;
	for ( var it = reference.iterator( {
		pageNo: 2
	}); it.hasNext();) {
		assertEquals("value1-" + (10 + (++i)), it.next().get("key"));
	}
	assertEquals(10, i);

	i = 0;
	for ( var it = reference.iterator( {
		pageNo: 1
	}); it.hasNext();) {
		assertEquals("value1-" + (++i), it.next().get("key"));
	}
	assertEquals(10, i);

	i = 0;
	for ( var it = reference.iterator( {
		pageNo: 5
	}); it.hasNext();) {
		assertEquals("value1-" + (40 + (++i)), it.next().get("key"));
	}
	assertEquals(10, i);
}

function testLookup1() {
	var dataType = getEntityDataType();
	var entity = new dorado.Entity( {
		p2: "key-5"
	}, null, dataType);

	assertEquals("value-5", entity.get("lookup1"));

	entity.set("p2", "key-3");
	assertEquals("value-3", entity.get("lookup1"));

	entity.set("p2", null);
	assertTrue(entity.get("lookup1") == null);
}
