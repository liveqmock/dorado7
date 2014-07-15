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

package com.bstek.dorado.view.config.xml;

import org.apache.commons.lang.StringUtils;
import org.springframework.util.CollectionUtils;
import org.w3c.dom.Node;

import com.bstek.dorado.data.config.xml.DataElementParser;
import com.bstek.dorado.data.config.xml.DataParseContext;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-2-4
 */
public class ItemsParser extends DataElementParser {

	@Override
	protected Object internalParse(Node node, DataParseContext context)
			throws Exception {
		Object value = super.internalParse(node, context);
		if (value instanceof String) {
			String[] items = StringUtils.split((String) value, ',');
			return (items != null) ? CollectionUtils.arrayToList(items) : null;
		}
		else {
			return value;
		}
	}

}
