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

package com.bstek.dorado.idesupport.parse;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.xml.XmlParseException;
import com.bstek.dorado.config.xml.XmlParser;
import com.bstek.dorado.core.pkgs.PackageInfo;
import com.bstek.dorado.idesupport.RuleTemplateManager;
import com.bstek.dorado.util.xml.DomUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-11-18
 */
public class PreloadParser implements XmlParser {

	public Object parse(Node node, ParseContext context) throws Exception {
		Element element = (Element) node;
		ConfigRuleParseContext parserContext = (ConfigRuleParseContext) context;
		RuleTemplateManager ruleTemplateManager = parserContext
				.getRuleTemplateManager();

		ruleTemplateManager.setVersion(element.getAttribute("version"));

		Element packagesElement = DomUtils.getChildByTagName(element,
				"PackageInfos");
		if (packagesElement != null) {
			List<PackageInfo> packageInfos = ruleTemplateManager
					.getPackageInfos();
			if (packageInfos == null) {
				packageInfos = new ArrayList<PackageInfo>();
				context.getAttributes().put("packageInfos", packageInfos);
			}

			for (Element child : DomUtils.getChildrenByTagName(packagesElement,
					"PackageInfo")) {
				String name = child.getAttribute("name");
				if (StringUtils.isEmpty(name)) {
					throw new XmlParseException("PackageName undefined.",
							child, parserContext);
				}
				PackageInfo packageInfo = new PackageInfo(name);
				packageInfo.setVersion(child.getAttribute("version"));
				packageInfos.add(packageInfo);
			}
		}

		Map<String, Element> ruleElementMap = parserContext.getRuleElementMap();
		for (Element child : DomUtils.getChildrenByTagName(element, "Rule")) {
			String name = child.getAttribute("name");
			if (StringUtils.isEmpty(name)) {
				throw new XmlParseException("RuleName undefined.", child,
						parserContext);
			}
			ruleElementMap.put(name, child);
		}
		return null;
	}
}
