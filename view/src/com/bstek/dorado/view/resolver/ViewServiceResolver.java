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
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.Writer;
import java.lang.reflect.Method;
import java.util.Map;

import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.aopalliance.intercept.MethodInterceptor;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.codehaus.jackson.node.ObjectNode;
import org.apache.commons.lang.StringUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.bstek.dorado.common.proxy.PatternMethodInterceptorFilter;
import com.bstek.dorado.common.proxy.SortableMethodInterceptorSet;
import com.bstek.dorado.core.Constants;
import com.bstek.dorado.core.io.InputStreamResource;
import com.bstek.dorado.core.xml.XmlDocumentBuilder;
import com.bstek.dorado.data.JsonUtils;
import com.bstek.dorado.util.proxy.BaseMethodInterceptorDispatcher;
import com.bstek.dorado.util.proxy.MethodInterceptorFilter;
import com.bstek.dorado.util.proxy.ProxyBeanUtils;
import com.bstek.dorado.util.xml.DomUtils;
import com.bstek.dorado.view.output.JsonBuilder;
import com.bstek.dorado.view.service.ServiceProcessor;
import com.bstek.dorado.web.DoradoContext;
import com.bstek.dorado.web.resolver.AbstractTextualResolver;
import com.bstek.dorado.web.resolver.HttpConstants;

/**
 * 用于为客户端提供特定服务的Web控制器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Nov 5, 2008
 */
public class ViewServiceResolver extends AbstractTextualResolver {
	private static final Log logger = LogFactory
			.getLog(ViewServiceResolver.class);

	private static final String JAVASCRIPT_TOKEN = "javascript";
	private static final String XML_TOKEN = "xml";
	private static final int BUFFER_SIZE = 4096;
	private static final String ACTION_ATTRIBUTE = ViewServiceResolver.class
			.getName() + ".action";

	private static class RootViewServiceInterceptor extends
			BaseMethodInterceptorDispatcher {
		private static final String METHOD_NAME = "invoke";

		public RootViewServiceInterceptor(
				MethodInterceptor[] subMethodInterceptors) {
			super(subMethodInterceptors);
		}

		@Override
		protected boolean filterMethod(Method method) {
			return method.getName().equals(METHOD_NAME);
		}

		@Override
		public MethodInterceptorFilter getMethodInterceptorFilter(
				Object object, Method method, Object[] args) {
			String action = (String) DoradoContext.getCurrent().getAttribute(
					ACTION_ATTRIBUTE);
			return new PatternMethodInterceptorFilter(action);
		}
	};

	private XmlDocumentBuilder xmlDocumentBuilder;
	private Map<String, ServiceProcessor> serviceProcessors;
	private SortableMethodInterceptorSet methodInterceptors = new SortableMethodInterceptorSet();

	private ViewServiceInvoker viewServiceInvoker;

	public ViewServiceResolver() {
		setContentType(HttpConstants.CONTENT_TYPE_XML);
	}

	private XmlDocumentBuilder getXmlDocumentBuilder(DoradoContext context)
			throws Exception {
		if (xmlDocumentBuilder == null) {
			xmlDocumentBuilder = (XmlDocumentBuilder) context
					.getServiceBean("xmlDocumentBuilder");
		}
		return xmlDocumentBuilder;
	}

	/**
	 * 设置包含各种服务的处理器的Map集合。其中Map的键为服务名，值为相应的处理器。
	 */
	public void setServiceProcessors(
			Map<String, ServiceProcessor> serviceProcessors) {
		this.serviceProcessors = serviceProcessors;
	}

	public void addMethodInterceptor(MethodInterceptor methodInterceptor) {
		if (viewServiceInvoker != null) {
			throw new IllegalStateException(
					"Can not add MethodInterceptor after the ViewServiceInvoker initialized.");
		}
		methodInterceptors.add(methodInterceptor);
	}

	protected ViewServiceInvoker getViewServiceInvoker() throws Exception {
		if (viewServiceInvoker == null) {
			RootViewServiceInterceptor rootMethodInterceptor = new RootViewServiceInterceptor(
					methodInterceptors.toArray(new MethodInterceptor[0]));
			viewServiceInvoker = (ViewServiceInvoker) ProxyBeanUtils
					.createBean(ViewServiceInvoker.class, rootMethodInterceptor);
		}
		return viewServiceInvoker;
	}

	/**
	 * @param writer
	 * @param jsonNode
	 * @param context
	 * @throws Exception
	 */
	protected void processTask(Writer writer, ObjectNode objectNode,
			DoradoContext context) throws Exception {
		String action = JsonUtils.getString(objectNode, "action");

		ServiceProcessor processor = serviceProcessors.get(action);
		if (processor == null) {
			throw new IllegalArgumentException("Unknown action [" + action
					+ "].");
		}

		context.setAttribute(ACTION_ATTRIBUTE, action);
		getViewServiceInvoker().invoke(action, processor, writer, objectNode,
				context);
	}

	/**
	 * @param jsonBuilder
	 * @param e
	 */
	protected void outputException(JsonBuilder jsonBuilder, Throwable throwable) {
		while (throwable.getCause() != null) {
			throwable = throwable.getCause();
		}

		String message = throwable.getMessage();
		if (message == null) {
			message = throwable.getClass().getSimpleName();
		}

		try {
			jsonBuilder.object(); // TODO: 此行在部分情况下会报错，与出错之前JSONBuilder的输出状态相关
			jsonBuilder.key("exceptionType").value("JavaException")
					.key("message").value(message).key("stackTrace");
			jsonBuilder.array();
			StackTraceElement[] stackTrace = throwable.getStackTrace();
			for (StackTraceElement stackTraceElement : stackTrace) {
				jsonBuilder.value(stackTraceElement.getClassName() + '.'
						+ stackTraceElement.getMethodName() + '('
						+ stackTraceElement.getFileName() + ':'
						+ stackTraceElement.getLineNumber() + ')');
			}
			jsonBuilder.endArray();
			jsonBuilder.endObject();
		} catch (Exception e) {
			// ignore e!!!
			throwable.printStackTrace();
		}
	}

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response)
			throws Exception {
		XmlEscapeWriter writer = new XmlEscapeWriter(getWriter(request,
				response));

		JsonBuilder jsonBuilder = new JsonBuilder(writer);
		ServletInputStream in = request.getInputStream();
		DoradoContext context = DoradoContext.getCurrent();
		try {
			String contentType = request.getContentType();
			if (contentType != null && contentType.contains(JAVASCRIPT_TOKEN)) {
				Reader reader = new InputStreamReader(in,
						Constants.DEFAULT_CHARSET);
				StringBuffer buf = new StringBuffer();
				char[] cs = new char[BUFFER_SIZE];
				for (int n; (n = reader.read(cs)) > 0;) {
					buf.append(new String(cs, 0, n));
				}

				ObjectNode objectNode = (ObjectNode) JsonUtils
						.getObjectMapper().readTree(buf.toString());

				processTask(writer, objectNode, context);
			} else if (contentType != null && contentType.contains(XML_TOKEN)) {
				Document document = getXmlDocumentBuilder(context)
						.loadDocument(
								new InputStreamResource(in, request
										.getRequestURI()));

				writer.append("<?xml version=\"1.0\" encoding=\""
						+ Constants.DEFAULT_CHARSET + "\"?>\n");
				writer.append("<result>\n");

				Writer escapeWriter = new XmlEscapeWriter(writer);
				for (Element element : DomUtils.getChildElements(document
						.getDocumentElement())) {
					writer.append("<request>\n");
					writer.append("<response type=\"json\"><![CDATA[\n");
					writer.setEscapeEnabled(true);

					String textContent = DomUtils.getTextContent(element);

					ObjectNode objectNode = (ObjectNode) JsonUtils
							.getObjectMapper().readTree(textContent);
					try {
						processTask(escapeWriter, objectNode, context);
						writer.setEscapeEnabled(false);

						writer.append("\n]]></response>\n");
					} catch (Exception e) {
						Throwable t = e;
						while (t.getCause() != null) {
							t = t.getCause();
						}
						writer.setEscapeEnabled(false);

						writer.append("\n]]></response>\n");
						if (t instanceof ClientRunnableException) {
							writer.append("<exception type=\"runnable\"><![CDATA[");
							writer.setEscapeEnabled(true);
							writer.append("(function(){")
									.append(((ClientRunnableException) t)
											.getScript()).append("})");
						} else {
							writer.append("<exception><![CDATA[\n");
							writer.setEscapeEnabled(true);
							outputException(jsonBuilder, e);
						}
						writer.setEscapeEnabled(false);
						writer.append("\n]]></exception>\n");
						logger.error(e, e);
					}
					writer.append("</request>\n");
				}

				writer.append("</result>");
			}
		} catch (Exception e) {
			in.close();

			Throwable t = e;
			while (t.getCause() != null) {
				t = t.getCause();
			}

			if (t instanceof ClientRunnableException) {
				response.setContentType("text/runnable");
				writer.append("(function(){")
						.append(((ClientRunnableException) t).getScript())
						.append("})");
			} else {
				response.setContentType("text/dorado-exception");
				outputException(jsonBuilder, e);
			}

			logger.error(e, e);
		} finally {
			writer.flush();
			writer.close();
		}
	}
}

class XmlEscapeWriter extends Writer {
	private Writer writer;
	private boolean escapeEnabled;

	public XmlEscapeWriter(Writer writer) {
		this.writer = writer;
	}

	public boolean isEscapeEnabled() {
		return escapeEnabled;
	}

	public void setEscapeEnabled(boolean escapeEnabled) {
		this.escapeEnabled = escapeEnabled;
	}

	public String escapeCDataContent(String str) {
		if (str == null) {
			return null;
		}
		return StringUtils.replace(str, "]]>", "]]]]><![CDATA[>");
	}

	@Override
	public void close() throws IOException {
		writer.close();
	}

	@Override
	public void flush() throws IOException {
		writer.flush();
	}

	@Override
	public Writer append(char c) throws IOException {
		return writer.append(c);
	}

	@Override
	public Writer append(CharSequence csq, int start, int end)
			throws IOException {
		if (escapeEnabled) {
			if (csq == null) {
				return writer.append(null, start, end);
			} else {
				return super.append(escapeCDataContent(csq.toString()), start,
						end);
			}
		} else {
			return writer.append(csq, start, end);
		}
	}

	@Override
	public Writer append(CharSequence csq) throws IOException {
		if (escapeEnabled) {
			if (csq == null) {
				return writer.append(null);
			} else {
				return super.append(escapeCDataContent(csq.toString()));
			}
		} else {
			return writer.append(csq);
		}
	}

	@Override
	public void write(char[] cbuf, int off, int len) throws IOException {
		writer.write(cbuf, off, len);
	}

	@Override
	public void write(char[] cbuf) throws IOException {
		writer.write(cbuf);
	}

	@Override
	public void write(String str, int off, int len) throws IOException {
		if (escapeEnabled) {
			writer.write(escapeCDataContent(str), off, len);
		} else {
			writer.write(str, off, len);
		}
	}

	@Override
	public void write(String str) throws IOException {
		if (escapeEnabled) {
			writer.write(escapeCDataContent(str));
		} else {
			writer.write(str);
		}
	}

	@Override
	public void write(int c) throws IOException {
		writer.write(c);
	}

}
