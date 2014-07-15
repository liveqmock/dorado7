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

package com.bstek.dorado.view.output;

import com.bstek.dorado.data.resolver.DataResolver;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since May 14, 2009
 */
public class DataResolverPropertyOutputter extends ObjectPropertyOutputter {

	@Override
	public void output(Object object, OutputContext context) throws Exception {
		DataResolver dataResolver = (DataResolver) object;
		JsonBuilder json = context.getJsonBuilder();
		json.beginValue();
		context.getWriter().write(
				"dorado.DataResolver.create(\"" + dataResolver.getId() + "\")");
		json.endValue();
	}
}
