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

package com.bstek.dorado.core.el;

import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.core.Configure;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.util.SingletonBeanFactory;

/**
 * Dorado核心EL隐式变量的初始化器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Dec 17, 2007
 */
public class CoreContextVarsInitializer implements ContextVarsInitializer {
	private static final Log logger = LogFactory
			.getLog(CoreContextVarsInitializer.class);

	public void initializeContext(Map<String, Object> vars) {
		try {
			vars.put("null", null);
			vars.put("this", null);
			vars.put("env", System.getenv());
			vars.put("system", System.getProperties());
			vars.put("configure", Configure.getStore());
			vars.put("context", Context.getCurrent());
			vars.put("ctx", new ContextWrapperMap(Context.getCurrent()));

			vars.put("util", SingletonBeanFactory
					.getInstance(ExpressionUtilsObject.class));
		} catch (Exception e) {
			logger.error(e, e);
		}
	}
}
