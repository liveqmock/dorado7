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

package com.bstek.dorado.core.resource;

import java.util.Locale;

import org.springframework.beans.factory.FactoryBean;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-8-16
 */
public class LocaleFactory implements FactoryBean<Locale> {
	private String language;
	private String country;

	public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	public String getCountry() {
		return country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	public Locale getObject() throws Exception {
		return new Locale(language, country);
	}

	public Class<Locale> getObjectType() {
		return Locale.class;
	}

	public boolean isSingleton() {
		return true;
	}

}
