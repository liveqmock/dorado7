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

package com.bstek.dorado.web.resolver;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.velocity.Template;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;
import org.apache.velocity.context.Context;
import org.apache.velocity.runtime.RuntimeConstants;

import com.bstek.dorado.core.Constants;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-1-31
 */
public class ErrorPageResolver extends AbstractTextualResolver {
	private static Log logger = LogFactory.getLog(ErrorPageResolver.class);

	public static final String EXCEPTION_ATTRIBUTE = "exception";

	private VelocityEngine velocityEngine;
	private Properties velocityProperties;
	private StringEscapeHelper stringEscapeHelper = new StringEscapeHelper();

	public ErrorPageResolver() {
		setContentType(HttpConstants.CONTENT_TYPE_HTML);
	}

	private VelocityEngine getVelocityEngine() throws Exception {
		if (velocityEngine == null) {
			velocityEngine = new VelocityEngine();

			velocityProperties = new Properties();
			velocityProperties.setProperty(RuntimeConstants.INPUT_ENCODING,
					Constants.DEFAULT_CHARSET);
			velocityProperties.setProperty(RuntimeConstants.OUTPUT_ENCODING,
					Constants.DEFAULT_CHARSET);
			velocityProperties
					.setProperty("file.resource.loader.class",
							"org.apache.velocity.runtime.resource.loader.ClasspathResourceLoader");
			velocityEngine.init(velocityProperties);
		}
		return velocityEngine;
	}

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response)
			throws Exception {
		try {
			doExcecute(request, response);
		} catch (Throwable t) {
			// 确保不会因再次抛出异常而进入死锁状态
			logger.error(t, t);
		}
	}

	private void doExcecute(HttpServletRequest request,
			HttpServletResponse response) throws Exception, IOException {
		response.setContentType(HttpConstants.CONTENT_TYPE_HTML);
		response.setCharacterEncoding(Constants.DEFAULT_CHARSET);

		Context velocityContext = new VelocityContext();
		Exception e = (Exception) request.getAttribute(EXCEPTION_ATTRIBUTE);
		if (e != null) {
			logger.error(e, e);

			if (e instanceof PageNotFoundException) {
				response.setStatus(HttpServletResponse.SC_NOT_FOUND);
			} else if (e instanceof PageAccessDeniedException) {
				response.setStatus(HttpServletResponse.SC_FORBIDDEN);
			}

			Throwable throwable = e;
			while (throwable.getCause() != null) {
				throwable = throwable.getCause();
			}

			String message = null;
			if (throwable != null) {
				message = throwable.getMessage();
			}
			message = StringUtils.defaultString(message, throwable.getClass()
					.getName());

			velocityContext.put("message", message);
			velocityContext.put(EXCEPTION_ATTRIBUTE, throwable);
		} else {
			velocityContext.put("message",
					"Can not gain exception information!");
		}
		velocityContext.put("esc", stringEscapeHelper);

		Template template = getVelocityEngine().getTemplate(
				"com/bstek/dorado/web/resolver/ErrorPage.html");

		PrintWriter writer = getWriter(request, response);
		try {
			template.merge(velocityContext, writer);
		} finally {
			writer.flush();
			writer.close();
		}
	}
}
