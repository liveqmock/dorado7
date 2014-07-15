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

var ajaxCounter = 0;
var data1, data2;

var ajax = dorado.Toolkits.getAjax($setting["ajax.dataProviderOptions"]);
ajax.addListener("beforeConnect", function(async, options) {
	ajaxCounter++;
});

jQuery(document).ready(function() {
	var w = new dorado.widget.View( {});
	function f(p, w) {
		w = new dorado.widget.DataSet( {
			"id": "ds1",
			"dataProvider": dorado.DataProvider.create("testProvider1")
		});
		w.addListener("onReady", function(self) {
			self.loadAsync();
		});
		p.addChild(w);

		w = new dorado.widget.DataSet( {
			"id": "ds2",
			"dataProvider": dorado.DataProvider.create("testProvider1")
		});
		p.addChild(w);

		w = new dorado.widget.DataLabel("label1");
		w.set("dataSet", p.id("ds2"));
		w.set("property", "key1");
		p.addChild(w);
	};
	f(w);
	w.addListener("onReady", function(self) {
		var ds1 = self.id("ds1");
		var ds2 = self.id("ds2");
		$waitFor( [ ds1, ds2 ], function() {
			data1 = ds1.getData();
			data2 = ds2.getData();
			setUpPageStatus = "complete";
		});
	});
	w.render();
});

function setUpPage() {
// do nothing
}

function testWaitFor() {
	assertNotNull(data1);
	assertTrue(data1 instanceof dorado.EntityList);
	assertNotNull(data2);
	assertTrue(data2 instanceof dorado.EntityList);
	assertFalse(data1 === data2);
	assertEquals(1, ajaxCounter);
}
