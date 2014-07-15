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

import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.annotation.DataProvider;
import com.bstek.dorado.common.service.ExposedServiceDefintion;
import com.bstek.dorado.common.service.ExposedServiceManager;
import com.bstek.dorado.console.web.DoradoObject.Type;
import com.bstek.dorado.data.config.definition.DataProviderDefinitionManager;
import com.bstek.dorado.data.config.definition.DataResolverDefinitionManager;
import com.bstek.dorado.data.config.definition.DataTypeDefinitionManager;
import com.bstek.dorado.data.provider.manager.DefaultDataProviderManager;
import com.bstek.dorado.data.resolver.manager.DefaultDataResolverManager;
import com.bstek.dorado.data.type.manager.DefaultDataTypeManager;
import com.bstek.dorado.util.PathUtils;
import com.bstek.dorado.web.DoradoContext;

/**
 * Dorado Object Service
 * 
 * @author Alex Tong (mailto:alex.tong@bstek.com)
 * @since 2012-12-27
 */
public class DoradoObjectController {
	/**
	 * 忽略掉console自身的Dorado对象列表
	 */
	private static final String excludePattern = "dorado.console.*";

	/**
	 * 判断给定的字符串是否匹配通配表达式。
	 * 
	 * @param text
	 *            要判断的字符串
	 * @return 是否匹配
	 */
	public static boolean match(String text) {
		return !((StringUtils.isNotEmpty(text)) ? PathUtils.match(
				excludePattern, text) : false);
	}

	@DataProvider
	public List<DoradoObject> getExposedServiceList() {
		ExposedServiceManager serviceManager = (ExposedServiceManager) DoradoContext
				.getCurrent().getWebApplicationContext()
				.getBean("dorado.exposedServiceManager");
		List<DoradoObject> list = new ArrayList<DoradoObject>();
		Collection<ExposedServiceDefintion> collection = serviceManager
				.getServices().values();
		Iterator<ExposedServiceDefintion> it = collection.iterator();
		DoradoObject doradoExpos;
		while (it.hasNext()) {
			ExposedServiceDefintion exposedService = (ExposedServiceDefintion) it
					.next();
			if (match(exposedService.getName())) {
				doradoExpos = new DoradoObject();
				doradoExpos.setBean(exposedService.getBean());
				doradoExpos.setMethod(exposedService.getMethod());
				doradoExpos.setName(exposedService.getName());
				list.add(doradoExpos);
			}
		}

		return list;
	}

	@DataProvider
	public List<DoradoObject> getDataProviderList() {
		DefaultDataProviderManager providerManager = (DefaultDataProviderManager) DoradoContext
				.getCurrent().getWebApplicationContext()
				.getBean("dorado.dataProviderManager");
		DataProviderDefinitionManager definitionManager = providerManager
				.getDataProviderDefinitionManager();
		Set<String> names = definitionManager.getDefinitions().keySet();

		Iterator<String> iterator = names.iterator();
		DoradoObject doradoLocation;
		List<DoradoObject> list = new ArrayList<DoradoObject>();
		while (iterator.hasNext()) {
			String name = (String) iterator.next();
			if (match(name)) {
				doradoLocation = new DoradoObject();
				doradoLocation.setName(name);
				doradoLocation.setType(Type.DataProvider);
				list.add(doradoLocation);
			}
		}
		return list;
	}

	@DataProvider
	public List<DoradoObject> getDataTypeList() {
		DefaultDataTypeManager dataTypeManager = (DefaultDataTypeManager) DoradoContext
				.getCurrent().getWebApplicationContext()
				.getBean("dorado.dataTypeManager");
		DataTypeDefinitionManager definitionManager = dataTypeManager
				.getDataTypeDefinitionManager();
		Set<String> names = definitionManager.getDefinitions().keySet();

		Iterator<String> iterator = names.iterator();
		DoradoObject doradoLocation;
		List<DoradoObject> list = new ArrayList<DoradoObject>();
		while (iterator.hasNext()) {
			String name = (String) iterator.next();
			if (match(name)) {
				doradoLocation = new DoradoObject();
				doradoLocation.setName(name);
				doradoLocation.setType(Type.DataProvider);
				list.add(doradoLocation);
			}
		}
		return list;
	}

	@DataProvider
	public List<DoradoObject> getDataResolverList() {
		DefaultDataResolverManager dataResolverManager = (DefaultDataResolverManager) DoradoContext
				.getCurrent().getWebApplicationContext()
				.getBean("dorado.dataResolverManager");
		DataResolverDefinitionManager definitionManager = dataResolverManager
				.getDataResolverDefinitionManager();
		Set<String> names = definitionManager.getDefinitions().keySet();

		Iterator<String> iterator = names.iterator();
		DoradoObject doradoLocation;
		List<DoradoObject> list = new ArrayList<DoradoObject>();
		while (iterator.hasNext()) {
			String name = (String) iterator.next();
			if (match(name)) {
				doradoLocation = new DoradoObject();
				doradoLocation.setName(name);
				doradoLocation.setType(Type.DataProvider);
				list.add(doradoLocation);
			}
		}
		return list;
	}

	@DataProvider
	public Collection<String> getViewConfigList() {
		DefaultDataResolverManager dataResolverManager = (DefaultDataResolverManager) DoradoContext
				.getCurrent().getWebApplicationContext()
				.getBean("dorado.dataResolverManager");
		DataResolverDefinitionManager definitionManager = dataResolverManager
				.getDataResolverDefinitionManager();
		return definitionManager.getDefinitions().keySet();
	}
}
