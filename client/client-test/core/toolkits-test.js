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

function testCreateInstance1() {
	var button = dorado.Toolkits.createInstance({
		$type: "dorado.widget.Button",
		id: "button1",
		caption: "TestButton"
	});
	assertNotNull(button);
	assertEquals("button1", button.get("id"));
	assertEquals("TestButton", button.get("caption"));
}

function testCreateInstance2() {
	var button = dorado.Toolkits.createInstance({
		$type: "Button",
		id: "button1",
		caption: "TestButton"
	}, "dorado.widget.");
	assertNotNull(button);
	assertEquals("button1", button.get("id"));
	assertEquals("TestButton", button.get("caption"));
}

function testCreateInstance3() {
	var button = dorado.Toolkits.createInstance({
		$type: "button",
		id: "button1",
		caption: "TestButton"
	}, function(type) {
		switch (type) {
			case "panel":
				return dorado.widget.Panel;
			case "button":
				return dorado.widget.Button;
			case "input":
				return dorado.widget.TextEditor;
			default:
				return dorado.widget.Control;
		}
	});
	assertNotNull(button);
	assertEquals("button1", button.get("id"));
	assertEquals("TestButton", button.get("caption"));
}
