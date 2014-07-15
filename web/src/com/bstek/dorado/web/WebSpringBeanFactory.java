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

package com.bstek.dorado.web;

import org.springframework.beans.factory.BeanFactory;

import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.SpringContextSupport;
import com.bstek.dorado.core.bean.SpringBeanFactorySupport;

public class WebSpringBeanFactory extends SpringBeanFactorySupport {

	@Override
	protected BeanFactory getBeanFactory() throws Exception {
		Context context = Context.getCurrent();
		if (context instanceof SpringContextSupport) {
			return ((SpringContextSupport) context).getApplicationContext();
		} else {
			throw new UnsupportedOperationException(
					"Method not supported in current Thread.");
		}
	}

	public String getBeanNamePrefix() {
		return "spring";
	}

}
