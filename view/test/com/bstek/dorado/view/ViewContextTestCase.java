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

package com.bstek.dorado.view;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.bstek.dorado.config.xml.XmlParser;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.core.xml.XmlDocumentBuilder;
import com.bstek.dorado.data.DataContextTestCase;
import com.bstek.dorado.view.config.definition.ViewDefinition;
import com.bstek.dorado.view.config.xml.ViewParseContext;
import com.bstek.dorado.view.manager.ViewConfig;
import com.bstek.dorado.view.manager.ViewConfigManager;

public abstract class ViewContextTestCase extends DataContextTestCase {
	public ViewContextTestCase() {
		addExtensionContextConfigLocation("com/bstek/dorado/view/context.xml");
		addExtensionContextConfigLocation("com/bstek/dorado/view/components-context.xml");
		addExtensionContextConfigLocation("com/bstek/dorado/view/test-context.xml");
	}

	protected ViewDefinition getViewDefinition(String path) throws Exception {
		Context context = Context.getCurrent();
		XmlDocumentBuilder xmlDocumentBuilder = (XmlDocumentBuilder) context
				.getServiceBean("xmlDocumentBuilder");
		XmlParser xmlParser = (XmlParser) context
				.getServiceBean("viewDocumentElementParser");

		Resource resource = context.getResource(path);

		ViewParseContext parseContext = new ViewParseContext();
		parseContext.setResourceName("TestView");
		parseContext.setResource(resource);

		Document document = xmlDocumentBuilder.loadDocument(resource);
		Element documentElement = document.getDocumentElement();
		ViewDefinition viewDefinition = (ViewDefinition) xmlParser.parse(
				documentElement, parseContext);
		return viewDefinition;
	}

	protected ViewConfig getViewConfig(String viewName) throws Exception {
		Context context = Context.getCurrent();
		ViewConfigManager viewConfigManager = (ViewConfigManager) context
				.getServiceBean("viewConfigManager");
		return viewConfigManager.getViewConfig(viewName);
	}

	protected View getView(String viewName) throws Exception {
		return getViewConfig(viewName).getView();
	}
}
