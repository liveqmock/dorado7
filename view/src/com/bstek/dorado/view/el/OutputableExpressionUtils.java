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

package com.bstek.dorado.view.el;

import com.bstek.dorado.core.el.Expression;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Dec 31, 2008
 */
public abstract class OutputableExpressionUtils {

	private static ExpressionInterceptingInjector injector = new ExpressionInterceptingInjector();

	static ExpressionInterceptingInjector getExpressionInterceptingInjector() {
		return injector;
	}

	/**
	 * 禁用支持客户端输出的表达式。
	 */
	public static void disableOutputableExpression() {
		injector.disableOutputableExpression();
	}

	/**
	 * 启用支持客户端输出的表达。
	 */
	public static void enableOutputableExpression() {
		injector.setSkipedExpression(null);
		injector.enableOutputableExpression();
	}

	/**
	 * 是否禁用了支持客户端输出的表达。
	 */
	public static boolean isOutputableExpressionDisabled() {
		return injector.isOutputableExpressionDisabled();
	}

	/**
	 * 返回最后一次被跳过的、原本应该执行的表达式对象。
	 */
	public static Expression getSkipedExpression() {
		return injector.getSkipedExpression();
	}

	/**
	 * 清楚之前记录的被跳过的表达式对象。
	 */
	public static void setSkipedExpression(Expression expression) {
		injector.setSkipedExpression(expression);
	}
}

class ExpressionInterceptingInjectorCounter {
	boolean disabled;
	Expression skipedExpression;
}

class ExpressionInterceptingInjector extends
		ThreadLocal<ExpressionInterceptingInjectorCounter> {

	public ExpressionInterceptingInjectorCounter get(boolean autoCreate) {
		ExpressionInterceptingInjectorCounter counter = get();
		if (counter == null) {
			counter = new ExpressionInterceptingInjectorCounter();
			set(counter);
		}
		return counter;
	}

	public void disableOutputableExpression() {
		get(true).disabled = true;
	}

	public void enableOutputableExpression() {
		get(true).disabled = false;
	}

	public boolean isOutputableExpressionDisabled() {
		ExpressionInterceptingInjectorCounter counter = get();
		return (counter == null) ? false : counter.disabled;
	}

	public Expression getSkipedExpression() {
		ExpressionInterceptingInjectorCounter counter = get();
		return (counter == null) ? null : counter.skipedExpression;
	}

	public void setSkipedExpression(Expression expression) {
		get(true).skipedExpression = expression;
	}
}
