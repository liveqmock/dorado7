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
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.util.Assert;

/**
 * 单独的EL表达式的描述对象。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 4, 2007
 * @see org.apache.commons.jexl.Expression
 */
public class SingleExpression extends AbstractExpression {
	private static final Log logger = LogFactory.getLog(SingleExpression.class);

	private Expression expression;

	public SingleExpression() {}

	/**
	 * @param expression Jexl的表达式对象。
	 */
	public SingleExpression(Expression expression) {
		Assert.notNull(expression);
		this.expression = expression;
	}

	/**
	 * @param expression
	 * @param evaluateMode
	 */
	public SingleExpression(Expression expression, EvaluateMode evaluateMode) {
		this(expression);
		setEvaluateMode(evaluateMode);
	}

	/**
	 * 返回Jexl的表达式对象。
	 */
	public Expression getExpression() {
		return expression;
	}

	@Override
	protected Object internalEvaluate() {
		try {
			Object value = internalEvaluateExpression(expression,
					getJexlContext());
			return value;
		}
		catch (Exception e) {
			logger.warn(e, e);
			return null;
		}
	}

	@Override
	public int hashCode() {
		return expression.getExpression().hashCode();
	}

	@Override
	public boolean equals(Object obj) {
		if (obj instanceof SingleExpression) {
			return ((SingleExpression) obj).expression.getExpression().equals(
					expression.getExpression());
		}
		else {
			return false;
		}
	}

	@Override
	public String toString() {
		StringBuffer sb = new StringBuffer();
		if (getEvaluateMode() == EvaluateMode.onRead) {
			sb.append('$');
		}
		sb.append("${").append(expression.getExpression()).append('}');
		return sb.toString();
	}

}
