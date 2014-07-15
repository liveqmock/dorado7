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

package com.bstek.dorado.core.xml;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;

import com.bstek.dorado.core.Constants;
import com.bstek.dorado.core.io.Resource;

/**
 * XML读取工具类的默认实现。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 15, 2007
 */
public class XercesXmlDocumentBuilder implements XmlDocumentBuilder {
	private static final Log logger = LogFactory
			.getLog(XercesXmlDocumentBuilder.class);

	protected DocumentBuilder getDocumentBuilder()
			throws ParserConfigurationException {
		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		factory.setIgnoringElementContentWhitespace(true);
		factory.setIgnoringComments(true);
		return factory.newDocumentBuilder();
	}

	public Document newDocument() throws Exception {
		return getDocumentBuilder().newDocument();
	}

	public Document loadDocument(Resource resource) throws Exception {
		if (logger.isDebugEnabled()) {
			logger.debug("Loading XML from " + resource);
		}

		InputStream in = resource.getInputStream();
		try {
			return getDocumentBuilder().parse(in);
		} finally {
			in.close();
		}
	}

	public Document loadDocument(Resource resource, String charset)
			throws Exception {
		if (logger.isDebugEnabled()) {
			logger.debug("Loading XML from " + resource);
		}

		if (StringUtils.isEmpty(charset)) {
			charset = Constants.DEFAULT_CHARSET;
		}

		InputStream in = resource.getInputStream();
		Reader reader = new InputStreamReader(in, charset);
		try {
			return getDocumentBuilder().parse(new InputSource(reader));
		} finally {
			reader.close();
			in.close();
		}
	}
}
