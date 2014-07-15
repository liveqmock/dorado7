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

import org.w3c.dom.Element;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.definition.ObjectDefinition;
import com.bstek.dorado.view.config.definition.ComponentDefinition;
import com.bstek.dorado.view.config.definition.ViewConfigDefinition;
import com.bstek.dorado.view.config.definition.ViewDefinition;
import com.bstek.dorado.view.config.xml.ViewParseContext;
import com.bstek.dorado.view.widget.ContainerParser;

/**
 * 视图节点的解析器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 30, 2008
 */
public class ViewParser extends ContainerParser {

	@Override
	protected ObjectDefinition createDefinition(Element element,
			ParseContext context) throws Exception {
		ViewParseContext viewContext = (ViewParseContext) context;
		ViewDefinition viewDefinition = new ViewDefinition(
				viewContext.getCurrentComponentTypeRegisterInfo());
		ViewConfigDefinition viewConfigDefinition = viewContext
				.getViewConfigDefinition();
		if (viewConfigDefinition != null) {
			viewConfigDefinition.setViewDefinition(viewDefinition);
		}
		return viewDefinition;
	}

	@Override
	protected void registerComponent(ComponentDefinition component,
			ViewParseContext context) {
		// do nothing
	}
}
