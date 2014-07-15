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

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.core.Configure;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.view.View;
import com.bstek.dorado.view.output.OutputContext;
import com.bstek.dorado.view.output.OutputUtils;
import com.bstek.dorado.view.output.Outputter;
import com.bstek.dorado.web.WebConfigure;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-6-1
 */
public abstract class PageOutputUtils {

	public static View getView(HttpServletRequest request) {
		return (View) request.getAttribute(View.class.getName());
	}

	private static OutputContext getOutputContext(HttpServletRequest request,
			Writer writer) {
		OutputContext outputContext = (OutputContext) request
				.getAttribute(OutputContext.class.getName());
		if (outputContext == null) {
			outputContext = new OutputContext(writer);
			request.setAttribute(OutputContext.class.getName(), outputContext);

			outputContext.setShouldOutputDataTypes(WebConfigure.getBoolean(
					"view.outputDataTypesInPageTemplate", true));
			outputContext.setUsePrettyJson(Configure
					.getBoolean("view.outputPrettyJson"));
		}
		return outputContext;
	}

	public static final void outputHeader(View view,
			HttpServletRequest request, HttpServletResponse response,
			Writer writer) throws Exception {
		OutputContext outputContext = getOutputContext(request, writer);
		Context context = Context.getCurrent();
		Outputter outputter = (Outputter) context
				.getServiceBean("pageHeaderOutputter");
		outputter.output(view, outputContext);
	}

	public static final void outputFooter(View view,
			HttpServletRequest request, HttpServletResponse response,
			Writer writer) throws Exception {
		OutputContext outputContext = getOutputContext(request, writer);
		Context context = Context.getCurrent();
		Outputter outputter = (Outputter) context
				.getServiceBean("pageFooterOutputter");
		outputter.output(new PageFooterOutputter.ViewWrapper(view, request,
				response), outputContext);
	}

	public static void outputException(Writer writer, Throwable throwable)
			throws IOException {
		writer.append("<h1 style=\"font-size:12pt; color:red\">");
		OutputUtils.outputString(writer, StringUtils.defaultString(
				throwable.getMessage(), throwable.getClass().getName()));
		writer.append("</h1>\n");
		writer.append("<ul>\n");
		StackTraceElement[] stes = throwable.getStackTrace();
		for (int i = 0; i < stes.length; i++) {
			StackTraceElement ste = stes[i];
			writer.append("<li>").append("at ");
			OutputUtils.outputString(writer, ste.toString());
			writer.append("</li>\n");
		}
		writer.append("</ul>\n");
	}
}
