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

package com.bstek.dorado.data.method;

import java.util.ArrayList;
import java.util.Collection;

import com.bstek.dorado.core.Context;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-11-23
 */
public class DefaultSystemOptionalParametersFactory implements
		SystemOptionalParametersFactory {
	private Collection<ParameterFactory> parametersFactory;

	public DefaultSystemOptionalParametersFactory() {
		parametersFactory = new ArrayList<ParameterFactory>();

		parametersFactory.add(new ParameterFactory() {
			public Object getParameter() {
				return Context.getCurrent();
			}

			public String getParameterName() {
				return "context";
			}

			public Class<?> getParameterType() {
				return Context.class;
			}
		});
	}

	public Collection<ParameterFactory> getOptionalParameters() {
		return parametersFactory;
	}

}
