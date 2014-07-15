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

package com.bstek.dorado.view.config.text;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.text.TextParseContext;
import com.bstek.dorado.config.text.TextParser;
import com.bstek.dorado.config.xml.TextPropertyParser;

/**
 * 默认的Map Text节点的解析分派器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Oct 5, 2008
 */
public class DefaultMapTextParserDispatcher extends TextPropertyParser {

	@Override
	protected Object parseText(String text, ParseContext context)
			throws Exception {
		TextParser parser = getTextParser();
		if (parser != null) {
			TextParseContext textContext = new TextParseContext();
			return parser.parse((text == null) ? null : text.toCharArray(),
					textContext);
		} else {
			return null;
		}
	}
}
