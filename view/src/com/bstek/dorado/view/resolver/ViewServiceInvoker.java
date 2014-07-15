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

import java.io.Writer;

import org.codehaus.jackson.node.ObjectNode;

import com.bstek.dorado.view.service.ServiceProcessor;
import com.bstek.dorado.web.DoradoContext;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-7-8
 */
public class ViewServiceInvoker {
	public void invoke(String action, ServiceProcessor serviceProcessor,
			Writer writer, ObjectNode objectNode, DoradoContext context)
			throws Exception {
		serviceProcessor.execute(writer, objectNode, context);
	}
}
