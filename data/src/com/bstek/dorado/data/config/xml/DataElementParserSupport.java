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

package com.bstek.dorado.data.config.xml;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.config.definition.DefinitionReference;
import com.bstek.dorado.core.el.Expression;
import com.bstek.dorado.data.config.DataTypeSupportedExpression;
import com.bstek.dorado.data.config.definition.DataCreationContext;
import com.bstek.dorado.data.config.definition.DataTypeDefinition;
import com.bstek.dorado.data.type.DataType;

/**
 * 数据节点解析器的抽象支持类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 16, 2008
 */
public class DataElementParserSupport extends GenericParser {

	/**
	 * 根据解析上下文中的状态返回当前数据节点的目标DataType。
	 * 
	 * @throws Exception
	 */
	protected DataType getCurrentDataType(DataParseContext context)
			throws Exception {
		DataType dataType = null;
		DefinitionReference<DataTypeDefinition> dataTypeRef = context
				.getCurrentDataType();
		if (dataTypeRef != null) {
			dataType = (DataType) dataTypeRef.getDefinition().create(
					new DataCreationContext());
		}
		return dataType;
	}

	/**
	 * 将一段文本类型的配置信息转化为与目标DataType向匹配的类型，目标DataType是根据解析上下文中的状态获得的。
	 * 
	 * @throws Exception
	 * @see #getCurrentDataType(DataParseContext)
	 */
	protected Object parseValueFromText(String valueText,
			DataParseContext context) throws Exception {
		Object value = valueText;
		if (StringUtils.isNotEmpty(valueText)) {
			Expression expression = getExpressionHandler().compile(valueText);
			if (expression != null) {
				DataType dataType = getCurrentDataType(context);
				if (dataType != null) {
					value = new DataTypeSupportedExpression(dataType,
							expression);
				} else {
					value = expression;
				}
			} else {
				DataType dataType = getCurrentDataType(context);
				if (dataType != null) {
					value = dataType.fromText(valueText);
				}
			}
		}
		return value;
	}

}
