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

package com.bstek.dorado.core.el;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.bstek.dorado.core.ContextTestCase;

public class DefaultExpressionHandlerTest extends ContextTestCase {
	private static class MockVarsInitializer implements ContextVarsInitializer {
		public void initializeContext(Map<String, Object> vars) {
			vars.put("Runtime", Runtime.getRuntime());
		}
	};

	private DefaultExpressionHandler defaultExpressionHandler = new DefaultExpressionHandler();

	@Override
	protected void setUp() throws Exception {
		super.setUp();
		List<ContextVarsInitializer> initializers = new ArrayList<ContextVarsInitializer>();
		initializers.add(new MockVarsInitializer());
		defaultExpressionHandler.setContextInitializers(initializers);
	}

	@Override
	protected void tearDown() throws Exception {
		super.tearDown();
	}

	public void testCompile() {
		String text = "\\${2*3}";
		assertNull(defaultExpressionHandler.compile(text));

		text = "${2*3";
		assertNull(defaultExpressionHandler.compile(text));

		text = "${2*3}";
		assertEquals(defaultExpressionHandler.compile(text).getClass(),
				SingleExpression.class);

		text = "ABC${2*3}";
		assertEquals(defaultExpressionHandler.compile(text).getClass(),
				CombinedExpression.class);

		text = "${2*3}ABC";
		assertEquals(defaultExpressionHandler.compile(text).getClass(),
				CombinedExpression.class);
	}

	public void testCompile2() {
		String text;
		
		text = "\"${2*3}\"";
		assertNotNull(defaultExpressionHandler.compile(text));
		
		text = "\"${2*3}";
		assertNotNull(defaultExpressionHandler.compile(text));
		
		text = "ABC${2*3";
		assertNull(defaultExpressionHandler.compile(text));
	}
	
	public void testGetJexlContext() throws Exception {
		String text;
		Object value;

		text = "${2*3}";
		value = defaultExpressionHandler.compile(text).evaluate();
		assertEquals(value, 6);

		text = "ABC${2*3}";
		value = defaultExpressionHandler.compile(text).evaluate();
		assertEquals(value, "ABC6");

		text = "${2*3}ABC";
		value = defaultExpressionHandler.compile(text).evaluate();
		assertEquals(value, "6ABC");

		text = "${2*3}ABC${2*3}";
		value = defaultExpressionHandler.compile(text).evaluate();
		assertEquals(value, "6ABC6");

		text = "${2*3}ABC\\${2*3}";
		value = defaultExpressionHandler.compile(text).evaluate();
		assertEquals(value, "6ABC${2*3}");

		text = "\\${2*3}ABC${2*3}";
		value = defaultExpressionHandler.compile(text).evaluate();
		assertEquals(value, "${2*3}ABC6");
	}
	
	public void testGetJexlContext2() throws Exception {
		String text;
		Object value;

		text = "$$${2*3}";
		value = defaultExpressionHandler.compile(text).evaluate();
		assertEquals("$$6", value);
	}

	public void testSetContextInitializers() throws Exception {
		String text;
		Object value;

		text = "${Runtime}";
		value = defaultExpressionHandler.compile(text).evaluate();
		assertEquals(value, Runtime.getRuntime());

		text = "${Runtime.availableProcessors()}";
		value = defaultExpressionHandler.compile(text).evaluate();
		assertTrue(value != new Long(0));
	}

	public void testMapExpression() throws Exception {
		{
			String text = "${{\"ID\":1}}";
			Expression expr = defaultExpressionHandler.compile(text);
			Object value = expr.evaluate();
			
			Map<Object, Object> expected = new HashMap<Object, Object>();
			expected.put("ID", Integer.valueOf(1));
			
			assertEquals(expected, value);
		}
		
		{
			String text = "${{\"ID\":1, 'NAME': 'AAA'}}";
			Expression expr = defaultExpressionHandler.compile(text);
			Object value = expr.evaluate();
			
			Map<Object, Object> expected = new HashMap<Object, Object>();
			expected.put("ID", Integer.valueOf(1));
			expected.put("NAME", "AAA");
			
			assertEquals(expected, value);
		}
		
	}
	
	public void testScript() {
		{
			String text = "\"${1+3}\"";
			Expression expr = defaultExpressionHandler.compile(text);
			Object value = expr.evaluate();
			String expected = "\"4\"";
			assertEquals(expected, value);
		}
		{
			String text = "'${1+3}'";
			Expression expr = defaultExpressionHandler.compile(text);
			Object value = expr.evaluate();
			String expected = "'4'";
			assertEquals(expected, value);
		}
		{
			String text = "'ABC'${1+3}'";
			Expression expr = defaultExpressionHandler.compile(text);
			Object value = expr.evaluate();
			String expected = "'ABC'4'";
			assertEquals(expected, value);
		} 
		{
			String text = "ABC${'44' + 'DD'}";
			Expression expr = defaultExpressionHandler.compile(text);
			Object value = expr.evaluate();
			String expected = "ABC44DD";
			assertEquals(expected, value);
		}
		{
			String text = "ABC${'44' + '55'}";
			Expression expr = defaultExpressionHandler.compile(text);
			Object value = expr.evaluate();
			String expected = "ABC99";
			assertEquals(expected, value);
		}
		{
			String text = "ABC${'$'}";
			Expression expr = defaultExpressionHandler.compile(text);
			Object value = expr.evaluate();
			String expected = "ABC$";
			assertEquals(expected, value);
		}
		{
			String text = "ABC${'\\$\\{'}";
			Expression expr = defaultExpressionHandler.compile(text);
			Object value = expr.evaluate();
			String expected = "ABC${";
			assertEquals(expected, value);
		}
		{
			String text = "ABC${'${5+4}'}";
			Expression expr = defaultExpressionHandler.compile(text);
			Object value = expr.evaluate();
			String expected = "ABC${5+4}";
			assertEquals(expected, value);
		}
		{//有异常抛出
			String text = "ABC${${5+5}}";
			Expression expr = defaultExpressionHandler.compile(text);
			assertNull(expr);
		}
	}
}
