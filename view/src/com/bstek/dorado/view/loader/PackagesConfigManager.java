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

package com.bstek.dorado.view.loader;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.w3c.dom.Document;

import com.bstek.dorado.config.xml.XmlParser;
import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.core.io.ResourceUtils;
import com.bstek.dorado.core.resource.ResourceManager;
import com.bstek.dorado.core.resource.ResourceManagerUtils;
import com.bstek.dorado.core.xml.XmlDocumentBuilder;

/**
 * 资源包配置的管理器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Sep 23, 2008
 */
public class PackagesConfigManager {
	private XmlDocumentBuilder xmlDocumentBuilder;
	private XmlParser xmlParser;
	private List<String> configLocations = new ArrayList<String>();
	private PackagesConfig packagesConfig;
	private ResourceManager resourceManager;

	private ResourceManager getResourceManager() {
		if (resourceManager == null) {
			resourceManager = ResourceManagerUtils
					.get(PackagesConfigManager.class);
		}
		return resourceManager;
	}

	/**
	 * 设置XML配置文件读取实现类。
	 */
	public void setXmlDocumentBuilder(XmlDocumentBuilder xmlDocumentBuilder) {
		this.xmlDocumentBuilder = xmlDocumentBuilder;
	}

	/**
	 * 设置用于完成XML解析的解析器。
	 */
	public void setXmlParser(XmlParser xmlParser) {
		this.xmlParser = xmlParser;
	}

	/**
	 * 设置要装载的资源包配置文件。
	 */
	public void setConfigLocations(List<String> configLocations) {
		this.configLocations.clear();
		this.configLocations.addAll(configLocations);
	}

	/**
	 * 添加一个资源包配置文件。
	 */
	public void addConfigLocation(String configLocation) {
		this.configLocations.add(configLocation);
	}

	/**
	 * 返回资源包配置信息对象。
	 * 
	 * @throws Exception
	 */
	public synchronized PackagesConfig getPackagesConfig() throws Exception {
		if (packagesConfig == null) {
			if (configLocations != null) {
				String[] locations = new String[configLocations.size()];
				configLocations.toArray(locations);
				packagesConfig = loadConfigs(ResourceUtils
						.getResources(locations));

				Map<String, Package> packages = packagesConfig.getPackages();
				for (Package pkg : packages.values()) {
					String name = pkg.getName();
					for (String depends : pkg.getDepends()) {
						if (packages.get(depends) == null) {
							throw new IllegalArgumentException(
									getResourceManager().getString(
											"dorado.common/unknownDependsPackage",
											name, depends));
						}
					}

					for (String dependedBy : pkg.getDependedBy()) {
						Package dependedPackage = packages.get(dependedBy);
						if (dependedPackage == null) {
							throw new IllegalArgumentException(
									getResourceManager().getString(
											"dorado.common/unknownDependedByPackage",
											name, dependedBy));
						}
						dependedPackage.getDepends().add(name);
					}
				}
			} else {
				packagesConfig = new PackagesConfig();
			}
		}
		return packagesConfig;
	}

	/**
	 * 装载一组资源包配置文件。
	 * 
	 * @throws Exception
	 */
	protected PackagesConfig loadConfigs(Resource[] resources) throws Exception {
		PackagesConfig packagesConfig = new PackagesConfig();
		PackagesConfigParseContext context = new PackagesConfigParseContext(
				packagesConfig);
		for (Resource resource : resources) {
			loadConfig(resource, context);
		}
		return packagesConfig;
	}

	/**
	 * 装载一个资源包配置文件。
	 * 
	 * @throws Exception
	 */
	protected void loadConfig(Resource resource,
			PackagesConfigParseContext context) throws Exception {
		Document document = xmlDocumentBuilder.loadDocument(resource);
		xmlParser.parse(document.getDocumentElement(), context);
	}
}
