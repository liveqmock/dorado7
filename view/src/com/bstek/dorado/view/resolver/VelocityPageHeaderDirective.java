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

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.velocity.context.InternalContextAdapter;
import org.apache.velocity.exception.MethodInvocationException;
import org.apache.velocity.exception.ParseErrorException;
import org.apache.velocity.exception.ResourceNotFoundException;
import org.apache.velocity.runtime.parser.node.Node;

import com.bstek.dorado.core.Configure;
import com.bstek.dorado.view.View;
import com.bstek.dorado.view.output.OutputContext;
import com.bstek.dorado.web.WebConfigure;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-9-9
 */
public class VelocityPageHeaderDirective extends AbstractDirective {
	public static final String OUTPUT_CONTEXT_ATTRIBUTE = "outputContext";

	@Override
	public String getName() {
		return "outputPageHeader";
	}

	@Override
	public int getType() {
		return LINE;
	}

	protected OutputContext createOutputContext(Writer writer) {
		OutputContext outputContext = new OutputContext(writer);
		outputContext.setShouldOutputDataTypes(WebConfigure.getBoolean(
				"view.outputDataTypesInPageTemplate", true));
		outputContext.setUsePrettyJson(Configure
				.getBoolean("view.outputPrettyJson"));
		return outputContext;
	}

	@Override
	public boolean render(InternalContextAdapter contextAdapter, Writer writer,
			Node node) throws IOException, ResourceNotFoundException,
			ParseErrorException, MethodInvocationException {
		try {
			View view = (View) contextAdapter.get("view");
			PageOutputUtils.outputHeader(view,
					(HttpServletRequest) contextAdapter.get("request"),
					(HttpServletResponse) contextAdapter.get("response"),
					writer);
		} catch (Exception e) {
			processException(contextAdapter, writer, e);
		}
		return true;
	}
}
