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

package com.bstek.dorado.data.config.xml;

import org.apache.commons.lang.StringUtils;
import org.w3c.dom.Element;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.definition.DefinitionReference;
import com.bstek.dorado.config.definition.ObjectDefinition;
import com.bstek.dorado.config.xml.XmlConstants;
import com.bstek.dorado.data.config.definition.DataResolverDefinition;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apr 29, 2009
 */
public class DataResolverParser extends GenericObjectParser {

	@Override
	@SuppressWarnings("unchecked")
	protected DefinitionReference<DataResolverDefinition>[] getParentDefinitionReferences(
			String parentNameText, ParseContext context) throws Exception {
		DefinitionReference<DataResolverDefinition> parentReference = ((DataParseContext) context)
				.getDataResolverReference(parentNameText,
						(DataParseContext) context);
		if (parentReference != null) {
			return new DefinitionReference[] { parentReference };
		} else {
			return null;
		}
	}

	@Override
	protected void initDefinition(ObjectDefinition definition, Element element,
			ParseContext context) throws Exception {
		super.initDefinition(definition, element, context);

		DataResolverDefinition dataResolver = (DataResolverDefinition) definition;

		String interceptor = (String) dataResolver
				.removeProperty(XmlConstants.ATTRIBUTE_INTERCEPTOR);
		if (StringUtils.isNotEmpty(interceptor)) {
			dataResolver.setInterceptor(interceptor);
		}
	}
}
