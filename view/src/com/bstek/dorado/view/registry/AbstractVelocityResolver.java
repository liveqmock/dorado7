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

package com.bstek.dorado.view.registry;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.apache.velocity.Template;

import com.bstek.dorado.view.resolver.VelocityHelper;
import com.bstek.dorado.web.resolver.AbstractTextualResolver;
import com.bstek.dorado.web.resolver.HttpConstants;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2013-7-2
 */
public abstract class AbstractVelocityResolver extends AbstractTextualResolver {
	private VelocityHelper velocityHelper;
	private String pageTemplate;

	public AbstractVelocityResolver() {
		setContentType(HttpConstants.CONTENT_TYPE_HTML);
		setCacheControl(HttpConstants.NO_CACHE);
	}

	public void setVelocityHelper(VelocityHelper velocityHelper) {
		this.velocityHelper = velocityHelper;
	}

	public VelocityHelper getVelocityHelper() {
		return velocityHelper;
	}

	public String getPageTemplate() {
		return pageTemplate;
	}

	public void setPageTemplate(String pageTemplate) {
		this.pageTemplate = pageTemplate;
	}

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response)
			throws Exception {
		if (StringUtils.isBlank(pageTemplate)) {
			throw new IllegalArgumentException("'pageTemplate' undefined.");
		}

		org.apache.velocity.context.Context velocityContext = velocityHelper
				.getContext(null, request, response);
		initVelocityContext(velocityContext, request, response);

		Template template = velocityHelper.getVelocityEngine().getTemplate(
				pageTemplate);
		PrintWriter writer = getWriter(request, response);
		try {
			template.merge(velocityContext, writer);
		} finally {
			writer.flush();
			writer.close();
		}
	}

	protected abstract void initVelocityContext(
			org.apache.velocity.context.Context velocityContext,
			HttpServletRequest request, HttpServletResponse response)
			throws Exception;

}
