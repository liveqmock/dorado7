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

var entities;

jQuery(document).ready(function() {
	var v = w = new dorado.widget.View( {});
	function f(p, w) {
		w = new dorado.widget.DataSet( {
			"id": "ds1",
			"dataProvider": "testProvider1",
			"dataType": "$p:testProvider1@testProvider1#ResultDataType"
		});
		w.addListener("onReady", function(self) {
			self.loadAsync();
		});
		p.addChild(w);

		w = new dorado.widget.DataSet( {
			"id": "dsLookup",
			"dataProvider": "providerLookup",
			"dataType": "[test.Lookup]"
		});
		w.addListener("onReady", function(sender) {
			sender.loadAsync();
		});
		p.addChild(w);
	};
	f(w);
	w.addListener("onReady", function(self) {
		var ds1 = self.id("ds1");
		var dsLookup = self.id("dsLookup");
		$waitFor( [ ds1, dsLookup ], function() {
			entities = dsLookup.getData();
			setUpPageStatus = "complete";
		});
	});
	w.render();
});

function setUpPage() {
// do nothing
}

function testLookup1() {
	var i = 5;
	entities.each(function(entity) {
		assertEquals("value" + i, entity.get("lookup1").get("value"));
		i--;
	});
}

function testLookup2() {
	var i = 5;
	entities.each(function(entity) {
		assertEquals("value" + i, entity.get("lookup2"));
		i--;
	});
}
