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

package com.bstek.dorado.console.web;

import java.text.Collator;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import com.bstek.dorado.annotation.DataProvider;
import com.bstek.dorado.console.web.outputter.Category;
import com.bstek.dorado.console.web.outputter.Component;
import com.bstek.dorado.console.web.outputter.Layout;
import com.bstek.dorado.console.web.outputter.Other;
import com.bstek.dorado.console.web.outputter.PropertyConfig;
import com.bstek.dorado.console.web.outputter.Validator;
import com.bstek.dorado.view.output.ClientOutputHelper;
import com.bstek.dorado.view.output.ObjectOutputter;

/**
 * Outputter Controller
 * 
 * @author Alex Tong (mailto:alex.tong@bstek.com)
 * @since 2012-12-27
 */

public class OutputterController {
	private ClientOutputHelper clientOutputHelper;

	public ClientOutputHelper getClientOutputHelper() {
		return clientOutputHelper;
	}

	public void setClientOutputHelper(ClientOutputHelper clientOutputHelper) {
		this.clientOutputHelper = clientOutputHelper;
	}

	private Comparator<PropertyConfig> propertyConfigComparator = new Comparator<PropertyConfig>() {
		@SuppressWarnings({ "unchecked", "rawtypes" })
		public int compare(PropertyConfig o1, PropertyConfig o2) {
			Comparator cmp = Collator.getInstance(java.util.Locale.ENGLISH);
			return cmp.compare(o1.getName(), o2.getName());
		}
	};

	@DataProvider
	public List<Category> getCategoryList() throws Exception {
		List<Category> list = new ArrayList<Category>();
		list.add(new Component());
		list.add(new Layout());
		list.add(new Validator());
		list.add(new Other());

		return list;

	}

	@DataProvider
	public List<PropertyConfig> getPropertyConfigs(String beanName)
			throws ClassNotFoundException, Exception {
		List<PropertyConfig> propertyConfigs = null;
		if (beanName != null) {
			propertyConfigs = new ArrayList<PropertyConfig>();
			ObjectOutputter outputter = (ObjectOutputter) clientOutputHelper
					.getOutputter(Class.forName(beanName));

			Map<String, com.bstek.dorado.view.output.PropertyConfig> configs = outputter
					.getPropertieConfigs();
			for (Entry<String, com.bstek.dorado.view.output.PropertyConfig> entry : configs
					.entrySet()) {
				Object propertyOutputter = entry.getValue().getOutputter();
				String property = entry.getKey();
				PropertyConfig config = new PropertyConfig();
				config.setName(property);
				if (propertyOutputter != null) {
					config.setOutputterName(propertyOutputter.getClass()
							.getName());
				}
				propertyConfigs.add(config);
			}
			Collections.sort(propertyConfigs, propertyConfigComparator);
		}
		return propertyConfigs;
	}
}
