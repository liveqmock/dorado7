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

package com.bstek.dorado.web;

import java.util.HashMap;
import java.util.Map;
import java.util.Stack;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-5-11
 */
public final class DoradoContextUtils {
	private static final String STACK_ATTRIBUTE = DoradoContextUtils.class
			.getName() + ".stack";
	private static final String MAP_ATTRIBUTE = DoradoContextUtils.class
			.getName() + ".map";

	private DoradoContextUtils() {
	}

	@SuppressWarnings("unchecked")
	private static Stack<Map<String, Object>> getViewContextStack(
			DoradoContext context) {
		Stack<Map<String, Object>> stack = (Stack<Map<String, Object>>) context
				.getAttribute(STACK_ATTRIBUTE);
		if (stack == null) {
			stack = new Stack<Map<String, Object>>();
			context.setAttribute(STACK_ATTRIBUTE, stack);
		}
		return stack;
	}

	@SuppressWarnings("unchecked")
	private static Map<Object, Map<String, Object>> getViewContextMap(
			DoradoContext context) {
		Map<Object, Map<String, Object>> map = (Map<Object, Map<String, Object>>) context
				.getAttribute(MAP_ATTRIBUTE);
		if (map == null) {
			map = new HashMap<Object, Map<String, Object>>();
			context.setAttribute(MAP_ATTRIBUTE, map);
		}
		return map;
	}

	public static void pushNewViewContextIfNecessary(DoradoContext context) {
		Stack<Map<String, Object>> stack = getViewContextStack(context);
		Map<String, Object> viewContext = null;
		if (!stack.isEmpty()) {
			viewContext = stack.peek();
			if (viewContext != null) {
				for (Map<String, Object> bindedViewContext : getViewContextMap(
						context).values()) {
					if (bindedViewContext == viewContext) {
						viewContext = null;
						break;
					}
				}
			}
		}

		if (viewContext == null) {
			viewContext = new HashMap<String, Object>();
		}
		pushNewViewContext(context, viewContext);
	}

	public static void pushNewViewContext(DoradoContext context,
			Map<String, Object> viewContext) {
		getViewContextStack(context).push(viewContext);
		context.setViewContext(viewContext);
	}

	public static void popViewContext(DoradoContext context) {
		Stack<Map<String, Object>> stack = getViewContextStack(context);
		stack.pop();
		if (stack.isEmpty()) {
			context.setViewContext(null);
		} else {
			context.setViewContext(stack.peek());
		}
	}

	public static void bindViewContext(DoradoContext context, Object object) {
		getViewContextMap(context).put(object, context.getViewContext());
	}

	public static Map<String, Object> getViewContextByBindingObject(
			DoradoContext context, Object object) {
		return getViewContextMap(context).get(object);
	}

	public static Map<String, Object> getViewContext(DoradoContext context) {
		return context.getViewContext();
	}
}
