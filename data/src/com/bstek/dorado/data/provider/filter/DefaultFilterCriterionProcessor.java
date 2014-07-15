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

package com.bstek.dorado.data.provider.filter;

import org.apache.commons.lang.StringEscapeUtils;

import com.bstek.dorado.data.type.BooleanDataType;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.data.type.DateDataType;
import com.bstek.dorado.data.type.NumberDataType;

public class DefaultFilterCriterionProcessor implements
		FilterCriterionProcessor {

	private static final FilterOperator[] OPERATORS = new FilterOperator[] {
			FilterOperator.like, FilterOperator.likeStart,
			FilterOperator.likeEnd, FilterOperator.eq, FilterOperator.gt,
			FilterOperator.ge, FilterOperator.lt, FilterOperator.le,
			FilterOperator.ne };

	public void doProcess(SingleValueFilterCriterion criterion)
			throws Exception {
		String expression = criterion.getExpression();
		DataType dataType = criterion.getDataType();
		FilterOperator filterOperator = null;

		for (int i = OPERATORS.length - 1; i >= 0; i--) {
			FilterOperator operator = OPERATORS[i];
			if (expression.startsWith(operator.toString())) {
				filterOperator = operator;
				expression = expression.substring(operator.toString().length());
				break;
			}
		}

		expression = expression.trim();
		if (filterOperator == null) {
			int len = expression.length();
			if ((dataType == null || !(dataType instanceof NumberDataType
					|| dataType instanceof BooleanDataType || dataType instanceof DateDataType))
					&& len > 1) {
				char firstChar = expression.charAt(0), lastChar = expression
						.charAt(len - 1);
				if (len > 2 && expression.charAt(len - 2) == '\\') {
					lastChar = 0;
				}

				if (firstChar != '*' && firstChar != '%') {
					firstChar = 0;
				}
				if (lastChar != '*' && lastChar != '%') {
					lastChar = 0;
				}

				if (firstChar > 0) {
					if (lastChar > 0) {
						if (len > 2) {
							filterOperator = FilterOperator.like;
							expression = expression.substring(1, len - 1);
						} else {
							filterOperator = FilterOperator.eq;
						}
					} else {
						filterOperator = FilterOperator.likeEnd;
						expression = expression.substring(1);
					}
				} else if (lastChar > 0) {
					filterOperator = FilterOperator.likeStart;
					expression = expression.substring(0, len - 1);
				} else {
					filterOperator = FilterOperator.like;
				}
			} else {
				filterOperator = FilterOperator.like;
			}
		}

		if (expression.indexOf('\\') >= 0) {
			expression = StringEscapeUtils.escapeJava(expression);
		}
		Object value = (dataType != null) ? dataType.fromText(expression)
				: expression;
		criterion.setFilterOperator(filterOperator);
		criterion.setValue(value);
	}

}
