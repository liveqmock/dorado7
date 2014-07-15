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

var Resource = dorado.util.Resource;

Resource.append( {
	property1: "string1",
	property2: "string2"
});

Resource.append("test.ns1", {
	property1: "ns1-string1",
	property2: "ns1-string2"
});

Resource.append("test.ns2", {
	property1: "ns2-string1",
	property2: "ns2-string2"
});

Resource.append("test.ns2", {
	property2: "ns2-string2-overwrited",
	property3: "ns2-string3",
	property4: "ns2-string4"
});

Resource.append("test.ns3.ns4", {
	property1: "My name is {0}, I'm {1} years old."
});

function test() {
	assertEquals("string1", Resource.get("property1"));
	assertEquals("string2", $resource("property2"));

	assertEquals("ns1-string1", Resource.get("test.ns1.property1"));
	assertEquals("ns1-string2", $resource("test.ns1.property2"));

	assertEquals("ns2-string1", Resource.get("test.ns2.property1"));
	assertEquals("ns2-string2-overwrited", $resource("test.ns2.property2"));
	assertEquals("ns2-string3", Resource.get("test.ns2.property3"));
	assertEquals("ns2-string4", $resource("test.ns2.property4"));

	assertEquals("My name is John, I'm 5 years old.", $resource("test.ns3.ns4.property1", "John", 5));
}
