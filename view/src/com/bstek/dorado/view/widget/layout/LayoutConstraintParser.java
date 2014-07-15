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

package com.bstek.dorado.view.widget.layout;

import java.util.Map;

import com.bstek.dorado.config.definition.ObjectDefinition;
import com.bstek.dorado.config.text.ConfigurableDispatchableTextParser;
import com.bstek.dorado.config.text.DispatchableTextParser;
import com.bstek.dorado.config.text.TextParseContext;

/**
 * 视图中布局条件的解析器的抽象类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Sep 30, 2008
 */
public class LayoutConstraintParser extends ConfigurableDispatchableTextParser {
	@Override
	public boolean supportsHeader() {
		return true;
	}

	@SuppressWarnings("unchecked")
	@Override
	public Object parse(char[] charArray, TextParseContext context)
			throws Exception {
		ObjectDefinition layoutDefinition = new ObjectDefinition();
		layoutDefinition.setImplType(CommonLayoutConstraint.class);

		Map<String, Object> attributes = (Map<String, Object>) super.parse(
				charArray, context);
		for (Map.Entry<String, Object> entry : attributes.entrySet()) {
			String key = entry.getKey();
			if (DispatchableTextParser.HEADER_ATTRIBUTE.equals(key)) {
				layoutDefinition.setProperty("type", entry.getValue());
			} else {
				layoutDefinition.setProperty(key, entry.getValue());
			}
		}
		return layoutDefinition;
	}
}
