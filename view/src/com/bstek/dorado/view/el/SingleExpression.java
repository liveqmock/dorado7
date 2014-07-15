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

import org.apache.commons.jexl2.Expression;

import com.bstek.dorado.core.el.EvaluateMode;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jun 5, 2009
 */
public class SingleExpression extends com.bstek.dorado.core.el.SingleExpression
		implements PrevaluateExpression {

	public SingleExpression(Expression expression) {
		super(expression);
	}

	public SingleExpression(Expression expression, EvaluateMode evaluateMode) {
		super(expression, evaluateMode);
	}

	@Override
	protected Object internalEvaluate() {
		if (this.getEvaluateMode() != EvaluateMode.onInstantiate
				&& OutputableExpressionUtils.isOutputableExpressionDisabled()) {
			OutputableExpressionUtils.setSkipedExpression(this);
			return null;
		} else {
			return super.internalEvaluate();
		}
	}

	public Object prevaluate() {
		return getExpression().getExpression();
	}

}
