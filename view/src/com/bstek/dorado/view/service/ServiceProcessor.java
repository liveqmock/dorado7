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

package com.bstek.dorado.view.service;

import java.io.Writer;

import org.codehaus.jackson.node.ObjectNode;

import com.bstek.dorado.web.DoradoContext;

/**
 * 用于为客户端提供Ajax服务的处理器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Nov 7, 2008
 */
public interface ServiceProcessor {
	/**
	 * 执行服务处理。
	 * 
	 * @param writer
	 *            面向客户端Response输出流的输出器。
	 * @param jsonNode
	 *            客户端提交的信息。
	 * @param context
	 *            Dorado上下文对象。
	 * @throws Exception
	 */
	void execute(Writer writer, ObjectNode objectNode, DoradoContext context)
			throws Exception;
}
