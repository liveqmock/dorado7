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

package com.bstek.dorado.view.resolver;

import java.io.IOException;
import java.io.Writer;

import org.apache.commons.lang.StringEscapeUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2013-1-15
 */
public abstract class ClientSettingsOutputter {

	protected void writeSetting(Writer writer, String key, Object value,
			boolean quote) throws IOException {
		writer.append(",\n\"").append(key).append('"').append(':');
		if (quote) {
			writer.append('"');
		}
		writer.append(StringEscapeUtils.escapeJavaScript(String.valueOf(value)));
		if (quote) {
			writer.append('"');
		}
	}

	public abstract void output(Writer writer) throws IOException;
}
