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

package com.bstek.dorado.view.resource;

import java.util.Locale;

import com.bstek.dorado.core.resource.LocaleResolver;
import com.bstek.dorado.web.DoradoContext;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-5-8
 */
public class SpringLocaleResolverAdapter implements LocaleResolver {
	private org.springframework.web.servlet.LocaleResolver springLocaleResolver;

	public void setSpringLocaleResolver(
			org.springframework.web.servlet.LocaleResolver springLocaleResolver) {
		this.springLocaleResolver = springLocaleResolver;
	}

	public Locale resolveLocale() throws Exception {
		Locale locale = null;
		if (springLocaleResolver != null) {
			DoradoContext content = DoradoContext.getCurrent();
			if (content instanceof DoradoContext) {
				locale = springLocaleResolver.resolveLocale(DoradoContext
						.getAttachedRequest());
			}
		}
		return locale;
	}

}
