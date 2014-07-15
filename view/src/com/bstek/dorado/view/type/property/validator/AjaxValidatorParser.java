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

package com.bstek.dorado.view.type.property.validator;

import org.apache.commons.lang.StringUtils;
import org.w3c.dom.Element;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.definition.ObjectDefinition;
import com.bstek.dorado.data.config.xml.GenericObjectParser;
import com.bstek.dorado.view.config.xml.ViewParseContext;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2014-1-6
 */
public class AjaxValidatorParser extends GenericObjectParser {
	
	@Override
	protected void initDefinition(ObjectDefinition definition, Element element,
			ParseContext context) throws Exception {
		super.initDefinition(definition, element, context);

		String service = (String) definition.getProperty("service");
		if (service != null && service.charAt(0) == '#') {
			String viewName = ((ViewParseContext) context).getResourceName();
			if (StringUtils.isNotEmpty(viewName)) {
				String prefix;
				int i1 = viewName.lastIndexOf('/');
				int i2 = viewName.lastIndexOf('.');
				int i = (i1 > i2) ? i1 : i2;
				if (i > 0 && i < (viewName.length() - 1)) {
					prefix = viewName.substring(i + 1);
				} else {
					prefix = viewName;
				}
				definition.setProperty("service",
						StringUtils.uncapitalize(prefix) + service);
			}
		}
	}
}
