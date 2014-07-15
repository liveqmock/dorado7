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

import org.apache.commons.jexl2.Expression;
import org.apache.commons.jexl2.JexlContext;

/**
 * EL表达式的抽象实现类。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 4, 2007
 */
public abstract class AbstractExpression implements
		com.bstek.dorado.core.el.Expression, ExpressionHandlerAware {

	/**
	 * EL表达式的处理器。
	 */
	protected ExpressionHandler elHandler;

	private EvaluateMode evaluateMode = EvaluateMode.onInstantiate;

	public void setExpressionHandler(ExpressionHandler elHandler) {
		this.elHandler = elHandler;
	}

	public EvaluateMode getEvaluateMode() {
		return evaluateMode;
	}

	public void setEvaluateMode(EvaluateMode evaluateMode) {
		this.evaluateMode = evaluateMode;
	}

	/**
	 * 返回一个Jexl的上下文对象。
	 * <p>
	 * 由于Dorado内部通过apache提供的JEXL通过包来实现EL表达式的解析和求值等操作，
	 * 因此在对EL表达式进行求值前需要首先获得一个有效的Jexl上下文对象。
	 * </p>
	 */
	protected JexlContext getJexlContext() {
		return elHandler.getJexlContext();
	}

	public final Object evaluate() {
		return internalEvaluate();
	}

	/**
	 * 内部的执行Jexl表达式的方法。
	 */
	protected abstract Object internalEvaluate();

	/**
	 * 内部的执行Jexl表达式的方法。<br>
	 * 如果返回的结果值仍是一个表达式，将进一步对该表达式进行求值。
	 */
	protected Object internalEvaluateExpression(Expression expression,
			JexlContext context) throws Exception {
		Object value = expression.evaluate(context);
		if (value != null && value instanceof com.bstek.dorado.core.el.Expression) {
			value = ((com.bstek.dorado.core.el.Expression) value).evaluate();
		}
		return value;
	}
}
