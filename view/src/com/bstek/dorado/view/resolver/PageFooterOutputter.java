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
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.velocity.Template;

import com.bstek.dorado.view.View;
import com.bstek.dorado.view.output.OutputContext;
import com.bstek.dorado.view.output.Outputter;
import com.bstek.dorado.view.widget.Control;
import com.bstek.dorado.view.widget.HtmlContainer;
import com.bstek.dorado.web.DoradoContext;

/**
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-6-1
 */
public class PageFooterOutputter implements Outputter {

	public static class ViewWrapper {
		private View view;
		private HttpServletRequest request;
		private HttpServletResponse response;

		public ViewWrapper(View view, HttpServletRequest request,
				HttpServletResponse response) {
			this.view = view;
			this.request = request;
			this.response = response;
		}

		public View getView() {
			return view;
		}

		public HttpServletRequest getRequest() {
			return request;
		}

		public HttpServletResponse getResponse() {
			return response;
		}
	}

	public void output(Object object, OutputContext context) throws Exception {
		ViewWrapper wrapper = (ViewWrapper) object;
		output(wrapper.getView(), wrapper.getRequest(), wrapper.getResponse(),
				context);
	}

	protected void output(View view, HttpServletRequest request,
			HttpServletResponse response, OutputContext outputContext)
			throws Exception {
		Writer writer = outputContext.getWriter();

		Map<Control, String> calloutHtmlMap = outputContext.getCalloutHtmlMap();
		if (calloutHtmlMap != null && !calloutHtmlMap.isEmpty()) {
			for (Map.Entry<Control, String> entry : calloutHtmlMap.entrySet()) {
				Control control = entry.getKey();
				String id = entry.getValue();
				if (control instanceof HtmlContainer) {
					outputHtmlContainerContent(request, response, writer,
							(HtmlContainer) control, id);
				} else if (control instanceof View) {
					outputSubViewHolderContent(request, response, writer,
							(View) control, id);
				}
			}
		}
	}

	protected void outputHtmlContainerContent(HttpServletRequest request,
			HttpServletResponse response, Writer writer,
			HtmlContainer htmlContainer, String id) throws Exception {
		String templateFile = htmlContainer.getContentFile();
		outputSubTemplate(request, response, writer, templateFile,
				htmlContainer.getView(), id);
	}

	protected void outputSubViewHolderContent(HttpServletRequest request,
			HttpServletResponse response, Writer writer, View subView, String id)
			throws Exception {
		String templateFile = subView.getPageTemplate();
		outputSubTemplate(request, response, writer, templateFile,
				subView.getView(), id);
	}

	protected void outputSubTemplate(HttpServletRequest request,
			HttpServletResponse response, Writer writer, String templateFile,
			View view, String id) throws Exception {
		writer.append("<div id=\"").append(id)
				.append("\" style=\"display:none\"/>");
		DoradoContext doradoContext = DoradoContext.getCurrent();
		VelocityHelper velocityHelper = (VelocityHelper) doradoContext
				.getServiceBean("velocityHelper");
		org.apache.velocity.context.Context subContext = velocityHelper
				.getContext(view, request, response);
		Template template = velocityHelper.getVelocityEngine().getTemplate(
				templateFile);
		template.merge(subContext, writer);
		writer.append("</div>\n");
	}
}
