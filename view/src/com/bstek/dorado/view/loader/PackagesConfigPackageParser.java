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

import java.util.Map;

import org.apache.commons.beanutils.BeanMap;
import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.lang.StringUtils;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.config.ConfigUtils;
import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.xml.ConfigurableDispatchableXmlParser;
import com.bstek.dorado.util.Assert;

/**
 * 资源包的解析器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Sep 24, 2008
 */
public class PackagesConfigPackageParser extends
		ConfigurableDispatchableXmlParser {
	private static final String NONE_FILE = "(none)";

	@Override
	@SuppressWarnings("unchecked")
	protected Object doParse(Node node, ParseContext context) throws Exception {
		Element element = (Element) node;
		String name = element.getAttribute("name");
		Assert.notEmpty(name);

		Package pkg;
		PackagesConfig packagesConfig = ((PackagesConfigParseContext) context)
				.getPackagesConfig();
		Map<String, Package> packages = packagesConfig.getPackages();
		pkg = packages.get(name);
		if (pkg == null) {
			pkg = new Package(name);
			packages.put(name, pkg);
		}

		Map<String, Object> properties = parseProperties(element, context);
		if (!properties.containsKey("fileNames")) {
			Object value = parseProperty("fileNames", element, context);
			if (value != null && value != ConfigUtils.IGNORE_VALUE) {
				properties.put("fileNames", value);
			}
		}

		String fileNamesText = StringUtils.trim((String) properties
				.remove("fileNames"));
		fileNamesText = StringUtils.defaultIfEmpty(fileNamesText, NONE_FILE);
		String[] oldFileNames = pkg.getFileNames();
		String[] newFileNames = fileNamesText.split(",");
		if (oldFileNames != null && oldFileNames.length > 0) {
			newFileNames = (String[]) ArrayUtils.addAll(oldFileNames,
					newFileNames);
		}
		pkg.setFileNames(newFileNames);

		String dependsText = (String) properties.remove("depends");
		if (StringUtils.isNotEmpty(dependsText)) {
			String[] dependsArray = dependsText.split(",");
			for (String depends : dependsArray) {
				pkg.getDepends().add(depends);
			}
		}

		String dependedByText = (String) properties.remove("dependedBy");
		if (StringUtils.isNotEmpty(dependedByText)) {
			String[] dependedByArray = dependedByText.split(",");
			for (String dependedBy : dependedByArray) {
				pkg.getDependedBy().add(dependedBy);
			}
		}

		String clientTypeText = (String) properties.remove("clientType");
		if (StringUtils.isNotEmpty(clientTypeText)) {
			pkg.setClientType(ClientType.parseClientTypes(clientTypeText));
		}

		((Map<String, Object>) new BeanMap(pkg)).putAll(properties);
		return pkg;
	}

}
