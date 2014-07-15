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

function onReady1() {
	event1Counter++;
}

function onReady2() {
	event2Counter++;
}

function onReady3() {
	event3Counter++;
}

var c1 = new dorado.widget.Component("c1");
var c2 = new dorado.widget.Component("c2");
var c3 = new dorado.widget.Component("c3");

var view = new dorado.widget.View({ layout: "Anchor" });
c1.addListener("onReady", onReady1);
c2.addListener("onReady", onReady2);
c3.addListener("onReady", onReady3);
view.addChild(c1);
view.addChild(c2);
view.addChild(c3);

var c4 = new dorado.widget.Container("c4");
var c5 = new dorado.widget.Container("c5");
var c6 = new dorado.widget.Component("c6");
c4.addChild(c5);
c5.addChild(c6);
view.addChild(c4);

var event1Counter = event2Counter = event3Counter = 0;

jQuery(document).ready(function() {
	view.render();
	setUpPageStatus = "complete";
});

function setUpPage() {
// do nothing
}

function testonReady() {
	assertEquals(1, event1Counter);
	assertEquals(1, event2Counter);
	assertEquals(1, event3Counter);
}

function testGetComponent() {
	assertEquals(c1, view.id("c1"));
	assertEquals(c4, view.id("c4"));
	assertEquals(c5, view.id("c5"));
	assertEquals(c6, view.id("c6"));

	view.removeChild(c4);

	assertEquals(c1, view.id("c1"));
	assertTrue(null == view.id("c4"));
	assertTrue(null == view.id("c5"));
	assertTrue(null == view.id("c6"));
}
