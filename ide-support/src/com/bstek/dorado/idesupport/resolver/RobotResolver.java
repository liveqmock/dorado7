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

package com.bstek.dorado.idesupport.resolver;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.bstek.dorado.core.Constants;
import com.bstek.dorado.core.io.InputStreamResource;
import com.bstek.dorado.core.xml.XmlDocumentBuilder;
import com.bstek.dorado.idesupport.robot.Robot;
import com.bstek.dorado.idesupport.robot.RobotRegistry;
import com.bstek.dorado.util.Assert;
import com.bstek.dorado.util.xml.DomUtils;
import com.bstek.dorado.web.DoradoContext;
import com.bstek.dorado.web.resolver.AbstractTextualResolver;
import com.bstek.dorado.web.resolver.HttpConstants;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-11-8
 */
@Deprecated
public class RobotResolver extends AbstractTextualResolver {
	private static Log logger = LogFactory.getLog(RobotResolver.class);

	private RobotRegistry robotRegistry;
	private XmlDocumentBuilder xmlDocumentBuilder;

	public RobotResolver() {
		setContentType(HttpConstants.CONTENT_TYPE_XML);
		setCacheControl(HttpConstants.NO_CACHE);
	}

	public void setRobotRegistry(RobotRegistry robotRegistry) {
		this.robotRegistry = robotRegistry;
	}

	private XmlDocumentBuilder getXmlDocumentBuilder(DoradoContext context)
			throws Exception {
		if (xmlDocumentBuilder == null) {
			xmlDocumentBuilder = (XmlDocumentBuilder) context
					.getServiceBean("xmlDocumentBuilder");
		}
		return xmlDocumentBuilder;
	}

	protected String getRobotName(HttpServletRequest request) {
		String uri = request.getRequestURI();
		int i = uri.lastIndexOf("/");
		if (i > 0 && i < uri.length() - 1) {
			return uri.substring(i + 1);
		}
		return null;
	}

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response)
			throws Exception {
		DoradoContext context = DoradoContext.getCurrent();
		Document document = null;
		List<Element> resultElements = null;
		Exception error = null;

		String robotName = getRobotName(request);
		Assert.notEmpty(robotName, "\"robotName\" undefined.");

		Robot robot = robotRegistry.getRobot(robotName);
		if (robot == null) {
			throw new IllegalArgumentException("Unknown robotName \""
					+ robotName + "\".");
		}

		ServletInputStream in = request.getInputStream();
		try {
			String charset = request.getCharacterEncoding();
			document = getXmlDocumentBuilder(context).loadDocument(
					new InputStreamResource(in, request.getRequestURI()),
					charset);
		} catch (Exception e) {
			logger.error(e, e);
			error = e;
		} finally {
			in.close();
		}

		Element documentElement = document.getDocumentElement();

		Element contentElement = DomUtils.getChildByTagName(documentElement,
				"Content");
		List<Element> elements = DomUtils.getChildElements(contentElement);

		Properties properties = null;
		Element propertiesElement = DomUtils.getChildByTagName(documentElement,
				"Properties");
		if (propertiesElement != null) {
			List<Element> propertieElements = DomUtils
					.getChildElements(propertiesElement);
			if (!propertieElements.isEmpty()) {
				properties = new Properties();
				for (Element propertyElement : propertieElements) {
					properties.setProperty(
							propertyElement.getAttribute("name"),
							DomUtils.getTextContent(propertyElement));
				}
			}
		}

		resultElements = new ArrayList<Element>();
		for (Element element : elements) {
			resultElements.add((Element) robot.execute(element, properties));
		}

		// Output
		document = getXmlDocumentBuilder(context).newDocument();
		Element responseElement = document.createElement("Response");
		document.appendChild(responseElement);
		if (error == null) {
			assembleContent(document, responseElement, resultElements);
		} else {
			responseElement.setAttribute("failed", "true");
			assembleError(document, responseElement, error);
		}

		PrintWriter writer = null;
		TransformerFactory transFactory = TransformerFactory.newInstance();
		try {
			Transformer transformer = transFactory.newTransformer();
			transformer
					.setOutputProperty("encoding", Constants.DEFAULT_CHARSET);
			transformer.setOutputProperty("indent", "yes");

			DOMSource source = new DOMSource(document);
			writer = getWriter(request, response);
			StreamResult result = new StreamResult(writer);
			transformer.transform(source, result);
		} finally {
			if (writer != null) {
				writer.flush();
				writer.close();
			}
		}
	}

	protected void assembleContent(Document document, Element responseElement,
			List<Element> elements) {
		Element contentElenment = document.createElement("Content");
		responseElement.appendChild(contentElenment);
		for (Element element : elements) {
			contentElenment.appendChild(document.adoptNode(element));
		}
	}

	protected void assembleError(Document document, Element responseElement,
			Exception error) {
		String message = error.getMessage();
		if (message == null) {
			message = error.getClass().getSimpleName();
		}
		Element messageElement = document.createElement("Message");
		messageElement.appendChild(document.createTextNode(message));
		responseElement.appendChild(messageElement);

		Element stackTraceElement = document.createElement("StackTrace");
		responseElement.appendChild(stackTraceElement);

		StackTraceElement[] stackTrace = error.getStackTrace();
		for (StackTraceElement ste : stackTrace) {
			Element element = document.createElement("Element");
			element.setAttribute("className", ste.getClassName());
			element.setAttribute("methodName", ste.getMethodName());
			element.setAttribute("fileName", ste.getFileName());
			element.setAttribute("lineNumber",
					String.valueOf(ste.getLineNumber()));
			stackTraceElement.appendChild(element);
		}
	}

}
