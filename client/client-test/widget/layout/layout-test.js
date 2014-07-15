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
	var layout = new dorado.widget.layout.Layout();
	var c1 = new dorado.widget.Component();
	var c2 = new dorado.widget.Component();
	var c3 = new dorado.widget.Component();

	assertEquals(0, layout._regions.size);

	layout.addControl(c1, "C1");
	assertEquals(1, layout._regions.size);

	layout.addControl(c2, "C2");
	layout.addControl(c3, "C3");
	assertEquals(3, layout._regions.size);

	layout.removeControl(c2);
	assertEquals(2, layout._regions.size);
}
