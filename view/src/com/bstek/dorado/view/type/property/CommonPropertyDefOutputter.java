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

package com.bstek.dorado.view.type.property;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.view.output.ClientObjectOutputter;
import com.bstek.dorado.view.output.OutputContext;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Dec 30, 2008
 */
public class CommonPropertyDefOutputter extends ClientObjectOutputter {
	private String type;

	/**
	 * @param type
	 *            the type to set
	 */
	public void setType(String type) {
		this.type = type;
	}

	@Override
	protected void outputObjectProperties(Object object, OutputContext context)
			throws Exception {
		if (StringUtils.isNotEmpty(type)) {
			context.getJsonBuilder().key("$type").value(type);
		}
		super.outputObjectProperties(object, context);
	}

}
