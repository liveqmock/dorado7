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

import junit.framework.Assert;

import com.bstek.dorado.core.Context;
import com.bstek.dorado.data.config.ConfigManagerTestSupport;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.data.util.DataUtils;

public class AdvanceFilterCriterionParserTest extends ConfigManagerTestSupport {

	FilterCriterionParser getFilterCriterionParser() throws Exception {
		Context context = Context.getCurrent();
		AdvanceFilterCriterionParser parser = (AdvanceFilterCriterionParser) context
				.getServiceBean("filterCriterionParser");
		return parser;
	}

	public void testLike() throws Exception {
		FilterCriterionParser parser = getFilterCriterionParser();

		String property = "p1";
		DataType dataType = DataUtils.getDataType(String.class);
		String expression = null;

		{
			expression = "%ccc";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.like,
					criterion.getFilterOperator());
			Assert.assertEquals(expression, criterion.getValue());
		}
		{
			expression = "ccc%";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.like,
					criterion.getFilterOperator());
			Assert.assertEquals(expression, criterion.getValue());
		}
		{
			expression = "%ccc%";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.like,
					criterion.getFilterOperator());
			Assert.assertEquals(expression, criterion.getValue());
		}
		{
			expression = "%";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.like,
					criterion.getFilterOperator());
			Assert.assertEquals(expression, criterion.getValue());
		}
	}

	@SuppressWarnings("deprecation")
	public void testCompare2() throws Exception {
		FilterCriterionParser parser = getFilterCriterionParser();

		String property = "p1";
		DataType dataType = DataUtils.getDataType(int.class);
		String expression = null;

		{
			expression = ">=3";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.ge,
					criterion.getFilterOperator());
			Assert.assertEquals(3, criterion.getValue());
		}
		{
			expression = "<=4";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.le,
					criterion.getFilterOperator());
			Assert.assertEquals(4, criterion.getValue());
		}
		{
			expression = "<>5";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.ne,
					criterion.getFilterOperator());
			Assert.assertEquals(5, criterion.getValue());
		}

		dataType = DataUtils.getDataType(java.util.Date.class);
		{
			expression = ">=2012-01-30";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.ge,
					criterion.getFilterOperator());
			Assert.assertEquals(new java.util.Date(112, 0, 30),
					criterion.getValue());
		}
		{
			expression = "<=2012-10-04";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.le,
					criterion.getFilterOperator());
			Assert.assertEquals(new java.util.Date(112, 9, 4),
					criterion.getValue());
		}
		{
			expression = "<>2012-09-23";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.ne,
					criterion.getFilterOperator());
			Assert.assertEquals(new java.util.Date(112, 8, 23),
					criterion.getValue());
		}
	}

	@SuppressWarnings("deprecation")
	public void testCompare1() throws Exception {
		FilterCriterionParser parser = getFilterCriterionParser();

		String property = "p1";
		DataType dataType = DataUtils.getDataType(int.class);
		String expression = null;

		{
			expression = ">3";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.gt,
					criterion.getFilterOperator());
			Assert.assertEquals(3, criterion.getValue());
		}
		{
			expression = "<4";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.lt,
					criterion.getFilterOperator());
			Assert.assertEquals(4, criterion.getValue());
		}
		{
			expression = "=5";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.eq,
					criterion.getFilterOperator());
			Assert.assertEquals(5, criterion.getValue());
		}

		dataType = DataUtils.getDataType(java.util.Date.class);
		{
			expression = ">2012-01-30";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.gt,
					criterion.getFilterOperator());
			Assert.assertEquals(new java.util.Date(112, 0, 30),
					criterion.getValue());
		}
		{
			expression = "<2012-10-04";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.lt,
					criterion.getFilterOperator());
			Assert.assertEquals(new java.util.Date(112, 9, 4),
					criterion.getValue());
		}
		{
			expression = "=2012-09-23";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.eq,
					criterion.getFilterOperator());
			Assert.assertEquals(new java.util.Date(112, 8, 23),
					criterion.getValue());
		}
	}

	@SuppressWarnings("deprecation")
	public void testBetween() throws Exception {
		FilterCriterionParser parser = getFilterCriterionParser();

		String property = "p1";
		DataType dataType = DataUtils.getDataType(int.class);
		String expression = null;

		{
			expression = "[3,30";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.between,
					criterion.getFilterOperator());
			Object[] values = (Object[]) criterion.getValue();
			Assert.assertEquals(3, values[0]);
			Assert.assertEquals(30, values[1]);
		}
		{
			expression = "[3,30]";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.between,
					criterion.getFilterOperator());
			Object[] values = (Object[]) criterion.getValue();
			Assert.assertEquals(3, values[0]);
			Assert.assertEquals(30, values[1]);
		}

		dataType = DataUtils.getDataType(java.util.Date.class);
		{
			expression = "[2012-07-04,2012-11-12";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.between,
					criterion.getFilterOperator());

			Object[] values = (Object[]) criterion.getValue();
			Assert.assertEquals(new java.util.Date(112, 6, 4), values[0]);
			Assert.assertEquals(new java.util.Date(112, 10, 12), values[1]);
		}
		{
			expression = "[2012-07-04,2012-11-12]";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.between,
					criterion.getFilterOperator());

			Object[] values = (Object[]) criterion.getValue();
			Assert.assertEquals(new java.util.Date(112, 6, 4), values[0]);
			Assert.assertEquals(new java.util.Date(112, 10, 12), values[1]);
		}
	}

	@SuppressWarnings("deprecation")
	public void testIn() throws Exception {
		FilterCriterionParser parser = getFilterCriterionParser();

		String property = "p1";
		DataType dataType = DataUtils.getDataType(int.class);
		String expression = null;

		{
			expression = "(3,30";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.in,
					criterion.getFilterOperator());
			Object[] values = (Object[]) criterion.getValue();
			Assert.assertEquals(3, values[0]);
			Assert.assertEquals(30, values[1]);
		}
		{
			expression = "(3,30)";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.in,
					criterion.getFilterOperator());
			Object[] values = (Object[]) criterion.getValue();
			Assert.assertEquals(3, values[0]);
			Assert.assertEquals(30, values[1]);
		}

		dataType = DataUtils.getDataType(java.util.Date.class);
		{
			expression = "(2012-07-04,2012-11-12";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.in,
					criterion.getFilterOperator());

			Object[] values = (Object[]) criterion.getValue();
			Assert.assertEquals(new java.util.Date(112, 6, 4), values[0]);
			Assert.assertEquals(new java.util.Date(112, 10, 12), values[1]);
		}
		{
			expression = "(2012-07-04,2012-11-12)";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.in,
					criterion.getFilterOperator());

			Object[] values = (Object[]) criterion.getValue();
			Assert.assertEquals(new java.util.Date(112, 6, 4), values[0]);
			Assert.assertEquals(new java.util.Date(112, 10, 12), values[1]);
		}
	}

	public void testDefault() throws Exception {
		FilterCriterionParser parser = getFilterCriterionParser();

		String property = "p1";
		DataType dataType = DataUtils.getDataType(int.class);
		String expression = null;

		{
			expression = "30";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.eq,
					criterion.getFilterOperator());
			Assert.assertEquals(30, criterion.getValue());
		}

		{
			expression = "3";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.eq,
					criterion.getFilterOperator());
			Assert.assertEquals(3, criterion.getValue());
		}

		dataType = DataUtils.getDataType(String.class);
		{
			expression = "30";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.like,
					criterion.getFilterOperator());
			Assert.assertEquals("30", criterion.getValue());
		}
		{
			expression = "3";
			SingleValueFilterCriterion criterion = (SingleValueFilterCriterion) parser
					.createFilterCriterion(property, dataType, expression);
			Assert.assertEquals(FilterOperator.like,
					criterion.getFilterOperator());
			Assert.assertEquals("3", criterion.getValue());
		}
	}
}
