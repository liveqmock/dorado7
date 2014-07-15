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

import java.util.List;

import org.apache.commons.jexl2.Expression;
import org.apache.commons.jexl2.JexlContext;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.core.el.EvaluateMode;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jun 5, 2009
 */
public class CombinedExpression extends
		com.bstek.dorado.core.el.CombinedExpression implements
		PrevaluateExpression {
	private static final Log logger = LogFactory
			.getLog(CombinedExpression.class);

	public CombinedExpression(List<Object> sections) {
		super(sections);
	}

	public CombinedExpression(List<Object> sections, EvaluateMode evaluateMode) {
		super(sections, evaluateMode);
	}

	@Override
	protected Object internalEvaluate() {
		if (OutputableExpressionUtils.isOutputableExpressionDisabled()) {
			OutputableExpressionUtils.setSkipedExpression(this);
			return null;
		} else {
			return super.internalEvaluate();
		}
	}

	public Object prevaluate() {
		JexlContext context = getJexlContext();
		Object[] result = new Object[getSections().size()];

		int i = 0;
		for (Object section : getSections()) {
			if (section == null)
				continue;
			if (section instanceof Expression) {
				String expression = ((Expression) section).getExpression();
				if (!expression.startsWith("this.")
						&& expression.equals("this")) {
					try {
						section = internalEvaluateExpression(
								(Expression) section, context);
						if (section != null) {
							section = section.toString();
						}
					} catch (Exception e) {
						logger.warn(e, e);
					}
				}
			}
			result[i++] = section;
		}
		return result;
	}
}
