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

import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.xml.XmlParseException;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 9, 2009
 */
public class ComplexDataTypeNameUnsupportedException extends XmlParseException {
	private static final long serialVersionUID = 6783743664393518931L;

	/**
	 * @param message
	 *            异常信息
	 */
	public ComplexDataTypeNameUnsupportedException(String message) {
		super(message);
	}

	/**
	 * @param message
	 *            异常信息
	 * @param context
	 *            解析上下文
	 */
	public ComplexDataTypeNameUnsupportedException(String message,
			ParseContext context) {
		super(message, context);
	}

	/**
	 * @param message
	 *            异常信息
	 * @param node
	 *            相关的XML节点
	 * @param context
	 *            解析上下文
	 */
	public ComplexDataTypeNameUnsupportedException(String message, Node node,
			ParseContext context) {
		super(message, node, context);
	}

}
