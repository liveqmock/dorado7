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

package com.bstek.dorado.view.output;

import java.io.IOException;
import java.io.Writer;

import org.apache.commons.lang.StringUtils;

/**
 * 用于将一个Java对象输出成为View对象的输出器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Oct 1, 2008
 */
public class ClientObjectOutputter extends ObjectOutputter {
	private static final String DEFAULT_SHORT_TYPE_NAME = "Default";

	private boolean usePrototype = false;
	private String shortTypeName;
	private String prototype;

	public boolean isUsePrototype() {
		return usePrototype;
	}

	public void setUsePrototype(boolean usePrototype) {
		this.usePrototype = usePrototype;
	}

	public String getShortTypeName() {
		return shortTypeName;
	}

	public void setShortTypeName(String shortTypeName) {
		this.shortTypeName = shortTypeName;
	}

	/**
	 * 返回该对象在客户端中的类型名。
	 */
	public String getPrototype() {
		return prototype;
	}

	/**
	 * 设置该对象在客户端中的类型名。
	 */
	public void setPrototype(String prototype) {
		this.prototype = prototype;
	}

	/**
	 * 将一个Java的POJO对象输出成为JSON对象。
	 */
	@Override
	protected void outputObject(Object object, OutputContext context)
			throws IOException, Exception {
		Writer writer = context.getWriter();
		if (object != null) {
			JsonBuilder json = context.getJsonBuilder();
			if (usePrototype && StringUtils.isNotEmpty(prototype)) {
				writer.write("new ");
				writer.write(prototype);
				writer.write("(");
			}

			if (isEscapeable(context)) {
				json.escapeableObject();
			} else {
				json.object();
			}

			if (!usePrototype && StringUtils.isNotEmpty(shortTypeName)
					&& !DEFAULT_SHORT_TYPE_NAME.equals(shortTypeName)) {
				json.key("$type").value(shortTypeName);
			}

			outputObjectProperties(object, context);
			json.endObject();

			if (usePrototype && StringUtils.isNotEmpty(prototype)) {
				writer.write(")");
			}
		} else {
			writer.append("null");
		}
	}
}
