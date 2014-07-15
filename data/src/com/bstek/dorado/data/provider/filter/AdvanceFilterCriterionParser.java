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

import java.util.List;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.data.provider.Criterion;
import com.bstek.dorado.data.type.DataType;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-3-1
 */
public class AdvanceFilterCriterionParser implements FilterCriterionParser {

	private List<FilterCriterionProcessor> criterionProcessors;

	public List<FilterCriterionProcessor> getCriterionProcessors() {
		return criterionProcessors;
	}

	public void setCriterionProcessors(
			List<FilterCriterionProcessor> criterionProcessors) {
		this.criterionProcessors = criterionProcessors;
	}

	public Criterion createFilterCriterion(String property, DataType dataType,
			String expression) throws Exception {
		if (StringUtils.isEmpty(expression)) {
			return null;
		}

		SingleValueFilterCriterion filterCriterion = new SingleValueFilterCriterion();
		filterCriterion.setProperty(property);
		filterCriterion.setDataType(dataType);
		filterCriterion.setExpression(expression);

		for (FilterCriterionProcessor processor : criterionProcessors) {
			processor.doProcess(filterCriterion);
			if (filterCriterion.getFilterOperator() != null) {
				return filterCriterion;
			}
		}

		throw new IllegalArgumentException("Unsupported expression ["
				+ expression + "]");
	}
}
