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

package com.bstek.dorado.view.output;

import java.io.StringWriter;

import junit.framework.TestCase;

public class JsonBuilderTest extends TestCase {

	public void testBaseFunction1() {
		StringWriter sw = new StringWriter();
		JsonBuilder jsonBuilder = new JsonBuilder(sw);
		jsonBuilder.object().key("key1").value("value1").key("key2")
				.value(null).endObject();
		assertEquals("{\"key1\":\"value1\",\"key2\":null}", sw.toString());
	}

	public void testBaseFunction2() {
		StringWriter sw = new StringWriter();
		JsonBuilder jsonBuilder = new JsonBuilder(sw);
		jsonBuilder.object().key("key1").value("value1");
		jsonBuilder.key("key2").beginValue();
		sw.write("<<Anything>>");
		jsonBuilder.endValue();
		jsonBuilder.key("key3").beginValue();
		sw.write("<<Anything>>");
		jsonBuilder.endValue();
		jsonBuilder.key("key4").value("value4").endObject();
		assertEquals(
				"{\"key1\":\"value1\",\"key2\":<<Anything>>,\"key3\":<<Anything>>,\"key4\":\"value4\"}",
				sw.toString());
	}

	public void testBaseFunction3() {
		StringWriter sw = new StringWriter();
		JsonBuilder jsonBuilder = new JsonBuilder(sw);

		jsonBuilder.array();

		jsonBuilder.object();
		jsonBuilder.endObject();

		jsonBuilder.beginValue();
		sw.write("<<Anything>>");
		jsonBuilder.endValue();

		jsonBuilder.object();
		jsonBuilder.endObject();

		jsonBuilder.endArray();

		assertEquals("[{},<<Anything>>,{}]", sw.toString());
	}

	public void testEscapeArray1() {
		StringWriter sw = new StringWriter();
		JsonBuilder jsonBuilder = new JsonBuilder(sw);

		jsonBuilder.escapeableArray();
		jsonBuilder.endArray();
		assertEquals("", sw.toString());
	}

	public void testEscapeArray2() {
		StringWriter sw = new StringWriter();
		JsonBuilder jsonBuilder = new JsonBuilder(sw);

		jsonBuilder.escapeableArray();
		jsonBuilder.value(1);
		jsonBuilder.value(2);
		jsonBuilder.value(3);
		jsonBuilder.endArray();
		assertEquals("[1,2,3]", sw.toString());
	}

	public void testEscapeObject1() {
		StringWriter sw = new StringWriter();
		JsonBuilder jsonBuilder = new JsonBuilder(sw);

		jsonBuilder.escapeableObject();
		jsonBuilder.endObject();
		assertEquals("", sw.toString());
	}

	public void testEscapeObject2() {
		StringWriter sw = new StringWriter();
		JsonBuilder jsonBuilder = new JsonBuilder(sw);

		jsonBuilder.escapeableObject();
		jsonBuilder.key("key1").value("value1");
		jsonBuilder.endObject();
		assertEquals("{\"key1\":\"value1\"}", sw.toString());
	}

	public void testEscapeKey1() {
		StringWriter sw = new StringWriter();
		JsonBuilder jsonBuilder = new JsonBuilder(sw);

		jsonBuilder.object();
		jsonBuilder.escapeableKey("key1").endKey();
		jsonBuilder.endObject();
		assertEquals("{}", sw.toString());
	}

	public void testEscapeKey2() {
		StringWriter sw = new StringWriter();
		JsonBuilder jsonBuilder = new JsonBuilder(sw);

		jsonBuilder.object();
		jsonBuilder.escapeableKey("key1").value("value1").endKey();
		jsonBuilder.endObject();
		assertEquals("{\"key1\":\"value1\"}", sw.toString());
	}

	public void testEscape1() {
		StringWriter sw = new StringWriter();
		JsonBuilder jsonBuilder = new JsonBuilder(sw);

		jsonBuilder.escapeableArray();
		jsonBuilder.escapeableObject();
		jsonBuilder.escapeableKey("key1");
		jsonBuilder.endKey();
		jsonBuilder.endObject();
		jsonBuilder.escapeableObject();
		jsonBuilder.escapeableKey("key2");
		jsonBuilder.endKey();
		jsonBuilder.endObject();
		jsonBuilder.endArray();
		assertEquals("", sw.toString());
	}

	public void testEscape2() {
		StringWriter sw = new StringWriter();
		JsonBuilder jsonBuilder = new JsonBuilder(sw);

		jsonBuilder.escapeableArray();
		jsonBuilder.escapeableObject();
		jsonBuilder.escapeableKey("key1").endKey();
		jsonBuilder.endObject();
		jsonBuilder.escapeableObject();
		jsonBuilder.escapeableKey("key2").value("value2").endKey();
		jsonBuilder.endObject();
		jsonBuilder.escapeableObject();
		jsonBuilder.escapeableKey("key3").endKey();
		jsonBuilder.endObject();
		jsonBuilder.endArray();
		assertEquals("[{\"key2\":\"value2\"}]", sw.toString());
	}

	public void testEscape3() {
		StringWriter sw = new StringWriter();
		JsonBuilder jsonBuilder = new JsonBuilder(sw);

		jsonBuilder.escapeableArray();
		jsonBuilder.escapeableObject();
		jsonBuilder.escapeableKey("key1");
		jsonBuilder.endKey();
		jsonBuilder.endObject();
		jsonBuilder.escapeableObject();
		jsonBuilder.escapeableKey("key2");

		jsonBuilder.beginValue();
		jsonBuilder.object();
		jsonBuilder.escapeableKey("key4");
		jsonBuilder.value("value4");
		jsonBuilder.endKey();
		jsonBuilder.endObject();
		jsonBuilder.endValue();

		jsonBuilder.endObject();
		jsonBuilder.escapeableObject();
		jsonBuilder.escapeableKey("key3").endKey();
		jsonBuilder.endObject();
		jsonBuilder.endArray();
		assertEquals("[{\"key2\":{\"key4\":\"value4\"}}]", sw.toString());
	}
}
