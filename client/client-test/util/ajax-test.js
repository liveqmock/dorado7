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
	Test.preloadAsyncTests( [ AsyncText, AsyncXML, AutoBatch ]);
}

var resourcePath = Test.ROOT + "resource/";

function testAjaxConnectionPool() {
	var connObj = dorado.util.AjaxConnectionPool.borrowObject();
	try {
		var conn = connObj.conn;
		assertNotNull(conn);

		conn.open("POST", "ajax-test.js", false);
		conn.send(null);
		assertNotNull(conn.responseText);
		assertTrue(conn.responseText.indexOf("testAjaxConnectionPool()") > 0);
	}
	finally {
		dorado.util.AjaxConnectionPool.returnObject(connObj);
	}
}

function testSyncText() {
	var options = {
		url: resourcePath + "ajax-response1.js"
	};
	var result = $ajax.requestSync(options);
	var department = result.getJsonData();
	assertEquals(department.id, "D1");
}

function testSyncXML() {
	var options = {
		url: resourcePath + "ajax-response1.xml"
	};
	var result = $ajax.requestSync(options);
	var xmlDoc = result.getXmlDocument();
	assertNotNull(xmlDoc);
	assertEquals(4, $(xmlDoc).find("node").size());
}

function testCData() {
	var options = {
		url: resourcePath + "ajax-response2.xml"
	};
	var result = $ajax.requestSync(options);
	var xmlDoc = result.getXmlDocument();
	var content = $(xmlDoc).find("result").text();
	assertTrue(content.indexOf("content in CDATA") > 0);
}

var AsyncText = {
	load: function() {
		var options = {
			url: resourcePath + "ajax-response1.js"
		};

		Test.asyncProcBegin("AsyncText");
		$ajax.request(options, function(result) {
			AsyncText.department = result.getJsonData();
			Test.asyncProcEnd("AsyncText");
		});
	},

	run: function() {
		assertEquals(this.department.id, "D1");
	}
};

function testAsyncText() {
	AsyncText.run();
}

var AsyncXML = {
	load: function() {
		var options = {
			url: resourcePath + "ajax-response1.xml"
		};

		Test.asyncProcBegin("AsyncXML");
		$ajax.request(options, function(result) {
			AsyncXML.result = result;
			Test.asyncProcEnd("AsyncXML");
		});
	},

	run: function() {
		var xmlDoc = this.result.getXmlDocument();
		assertNotNull(xmlDoc);
		assertEquals(4, $(xmlDoc).find("node").size());
	}
};

function testAsyncXML() {
	AsyncXML.run();
}

var AutoBatch = {
	beforeRequestCounter: 0,
	onRequestCounter: 0,
	beforeConnectCounter: 0,
	onConnectCounter: 0,

	load: function() {
		var engine = new dorado.util.AjaxEngine();
		engine.set("defaultOptions", {
			url: resourcePath + "ajax-batch-response1.xml"
		});
		engine.set("autoBatchEnabled", true);

		engine.addListener("beforeRequest", function(self, arg) {
			AutoBatch.beforeRequestCounter += arg.options.id;
		});

		engine.addListener("onRequest", function(self, arg) {
			AutoBatch.onRequestCounter += arg.result.options.id;
		});

		engine.addListener("beforeConnect", function(self, arg) {
			AutoBatch.beforeConnectCounter++;
		});

		engine.addListener("onConnect", function(self, arg) {
			AutoBatch.onConnectCounter++;
		});

		Test.asyncProcBegin("AutoBatch1");
		engine.request( {
			id: 1,
			xmlData: "<node>Yeah!</node>"
		}, function(result) {
			AutoBatch.result1 = result;
			Test.asyncProcEnd("AutoBatch1");
		});

		Test.asyncProcBegin("AutoBatch2");
		engine.request( {
			id: 10,
			jsonData: {
				p1: "value1",
				p2: true,
				p3: 9999
			}
		}, function(result) {
			AutoBatch.result2 = result;
			Test.asyncProcEnd("AutoBatch2");
		});

		Test.asyncProcBegin("AutoBatch3");
		engine.request( {
			id: 100,
			xmlData: "<property name=\"name1\" value=\"value1\" />"
		}, function(result) {
			AutoBatch.result3 = result;
			Test.asyncProcEnd("AutoBatch3");
		});
	},

	run: function() {
		assertEquals(111, this.beforeRequestCounter);
		assertEquals(111, this.onRequestCounter);
		assertEquals(1, this.beforeConnectCounter);
		assertEquals(1, this.onConnectCounter);

		var xmlDoc = this.result1.getXmlDocument();
		assertNotNull(xmlDoc);
		assertEquals(4, $(xmlDoc).find("node").size());

		var department = this.result2.getJsonData();
		assertEquals("D1", department.id);

		var xmlDoc = this.result3.getXmlDocument();
		var content = $(xmlDoc).find("result").text();
		assertTrue(content.indexOf("content in CDATA") > 0);
	}
};

function testAutoBatch() {
	AutoBatch.run();
}
