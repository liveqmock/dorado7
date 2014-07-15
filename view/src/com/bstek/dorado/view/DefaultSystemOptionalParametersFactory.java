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

import java.util.Collection;

import javax.servlet.http.HttpServletRequest;

import com.bstek.dorado.data.method.ParameterFactory;
import com.bstek.dorado.web.DoradoContext;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-9-16
 */
public class DefaultSystemOptionalParametersFactory extends
		com.bstek.dorado.data.method.DefaultSystemOptionalParametersFactory {

	public DefaultSystemOptionalParametersFactory() {
		Collection<ParameterFactory> parametersFactory = getOptionalParameters();

		parametersFactory.add(new ParameterFactory() {
			public Object getParameter() {
				return DoradoContext.getAttachedRequest();
			}

			public String getParameterName() {
				return "request";
			}

			public Class<?> getParameterType() {
				return HttpServletRequest.class;
			}
		});
	}

}
