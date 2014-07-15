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
import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.xml.PropertyParser;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-2-22
 */
public class DataTypePropertyParser extends PropertyParser {
	protected DataObjectParseHelper dataObjectParseHelper;

	public void setDataObjectParseHelper(
			DataObjectParseHelper dataObjectParseHelper) {
		this.dataObjectParseHelper = dataObjectParseHelper;
	}

	@Override
	protected Object doParse(Node node, ParseContext context) throws Exception {
		Object value = super.doParse(node, context);
		if (value instanceof String) {
			String dataTypeName = (String) value;
			if (StringUtils.isNotEmpty(dataTypeName)) {
				value = dataObjectParseHelper.getDataTypeByName(dataTypeName,
						(DataParseContext) context, true);
			}
		}
		return value;
	}

}
