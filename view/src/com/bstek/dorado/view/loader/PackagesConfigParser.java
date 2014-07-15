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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import net.sf.cglib.beans.BeanMap;

import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.lang.StringUtils;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.xml.ConfigurableDispatchableXmlParser;
import com.bstek.dorado.util.xml.DomUtils;

/**
 * 资源包配置信息的解析器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Sep 23, 2008
 */
public class PackagesConfigParser extends ConfigurableDispatchableXmlParser {

	@Override
	@SuppressWarnings("unchecked")
	protected Object doParse(Node node, ParseContext context) throws Exception {
		PackagesConfig packagesConfig = ((PackagesConfigParseContext) context)
				.getPackagesConfig();

		Element element = (Element) node;
		Map<String, Object> properties = parseProperties(element, context);
		((Map<String, Object>) BeanMap.create(packagesConfig))
				.putAll(properties);

		Element patternsElem = DomUtils.getChildByTagName(element, "Patterns");
		if (patternsElem != null) {
			Map<String, Pattern> patterns = packagesConfig.getPatterns();
			List<?> list = dispatchChildElements(patternsElem, context);
			for (Object e : list) {
				Pattern pattern = (Pattern) e;
				patterns.put(pattern.getName(), pattern);
			}
		}

		Element packagesElem = DomUtils.getChildByTagName(element, "Packages");
		if (packagesElem != null) {
			dispatchChildElements(packagesElem, context);
		}

		neatenPackagesConfig(packagesConfig);
		return null;
	}

	protected void neatenPackagesConfig(PackagesConfig packagesConfig)
			throws Exception {
		Map<String, Pattern> patterns = packagesConfig.getPatterns();
		Map<String, Pattern> patternMap = new HashMap<String, Pattern>();
		for (Package pkg : packagesConfig.getPackages().values()) {
			Pattern pattern = null;
			String patternName = pkg.getPattern(), baseUri = pkg.getBaseUri(), patternBaseUri = null;
			if (StringUtils.isNotEmpty(patternName)) {
				pattern = patterns.get(patternName);
				if (pattern != null) {
					patternBaseUri = pattern.getBaseUri();

					if (pattern != null && baseUri != null
							&& !baseUri.equals(patternBaseUri)) {
						String key = patternName + '$' + baseUri;
						Pattern pattern2 = patternMap.get(key);
						if (pattern2 == null) {
							String newPatternName;
							int i = 2;
							do {
								newPatternName = pattern.getName() + '$' + i;
								i++;
							} while (patterns.containsKey(newPatternName));

							pattern2 = new Pattern(newPatternName);
							PropertyUtils.copyProperties(pattern2, pattern);
							pattern2.setBaseUri(baseUri);
							patternMap.put(key, pattern2);
							patterns.put(newPatternName, pattern2);
						}
						pkg.setPattern(pattern2.getName());
					}
				}
			}
		}
	}
}
