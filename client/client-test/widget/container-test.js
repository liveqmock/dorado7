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

function testChildren() {
	var ct1 = new dorado.widget.Container();
	var ct2 = new dorado.widget.Container();
	var c1 = new dorado.widget.Component();
	var c2 = new dorado.widget.Component();
	var c3 = new dorado.widget.Component();

	assertEquals(0, ct1.get("children").size);

	ct1.addChild(c1);
	assertEquals(1, ct1.get("children").size);
	assertTrue(ct1 === c1.get("parent"));

	ct1.addChild(c2);
	ct1.addChild(c3);
	assertEquals(3, ct1.get("children").size);

	ct1.removeChild(c2);
	assertEquals(2, ct1.get("children").size);

	ct1.addChild(c2);
	assertEquals(3, ct1.get("children").size);

	ct2.addChild(c2);
	assertEquals(2, ct1.get("children").size);
	assertEquals(1, ct2.get("children").size);
	assertTrue(ct2 === c2.get("parent"));

	ct2.addChild(c3);
	assertEquals(1, ct1.get("children").size);
	assertEquals(2, ct2.get("children").size);
}

function testonReadyEvent() {
	function onEvent1() {
		event1Counter++;
	}

	function onEvent2() {
		event2Counter++;
	}

	var ct1 = new dorado.widget.Container();
	var ct2 = new dorado.widget.Container();
	var event1Counter = event2Counter = 0;

	ct1.addListener("onReady", onEvent1);
	ct1.onReady();
	assertEquals(1, event1Counter);
	assertEquals(0, event2Counter);

	ct2.addListener("onReady", onEvent2);
	ct2.onReady();
	assertEquals(1, event1Counter);
	assertEquals(1, event2Counter);
}

function testChildrenonReadyEvent() {
	function onEvent1() {
		event1Counter++;
	}

	function onEvent2() {
		event2Counter++;
	}

	var ct = new dorado.widget.Container();
	var c1 = new dorado.widget.Component();
	var c2 = new dorado.widget.Component();
	ct.addChild(c1);
	ct.addChild(c2);
	c1.addListener("onReady", onEvent1);
	c2.addListener("onReady", onEvent2);

	var event1Counter = event2Counter = 0;
	ct.onReady();
	assertEquals(1, event1Counter);
	assertEquals(1, event2Counter);
}
