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

function testFunctionInJSON() {
	var text = "{\n" + "	\"p1\": \"value1\",\n" +
	"	\"p2\": function() {\n" +
	"		return \"value2\";\n" +
	"	},\n" +
	"	\"p3\": (function() {\n" +
	"		return \"value3\";\n" +
	"	})()\n" +
	"}";
	
	var json = eval("(" + text + ")");
	assertEquals("value2", json.p2());
	assertEquals("value3", json.p3);
	
	var text = JSON.stringify(json, function(key, value) {
		return (value instanceof Function) ? value.call(this) : value;
	});
	
	json = eval("(" + text + ")");
	assertEquals("value2", json.p2);
	assertEquals("value3", json.p3);
}
