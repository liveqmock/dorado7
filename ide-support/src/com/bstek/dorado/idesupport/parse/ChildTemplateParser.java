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

import java.util.List;
import java.util.Map;

import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.lang.StringUtils;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.xml.ConfigurableDispatchableXmlParser;
import com.bstek.dorado.config.xml.XmlParseException;
import com.bstek.dorado.idesupport.template.ChildTemplate;
import com.bstek.dorado.idesupport.template.RuleTemplate;
import com.bstek.dorado.util.xml.DomUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-11-19
 */
public class ChildTemplateParser extends ConfigurableDispatchableXmlParser {

	private RuleTemplateParser ruleTemplateParser;
	private RuleTemplateParser globalRuleTemplateParser;

	public void setRuleTemplateParser(RuleTemplateParser ruleTemplateParser) {
		this.ruleTemplateParser = ruleTemplateParser;
	}

	public void setGlobalRuleTemplateParser(
			RuleTemplateParser globalRuleTemplateParser) {
		this.globalRuleTemplateParser = globalRuleTemplateParser;
	}

	@Override
	protected Object doParse(Node node, ParseContext context) throws Exception {
		Element element = (Element) node;
		ConfigRuleParseContext parserContext = (ConfigRuleParseContext) context;

		Map<String, Object> properties = this.parseProperties(element, context);
		String name = (String) properties.remove("name");

		RuleTemplate ruleTemplate;
		String ruleName = (String) properties.remove("rule");
		if (StringUtils.isNotEmpty(ruleName)) {
			ruleTemplate = globalRuleTemplateParser.getRuleTemplate(ruleName,
					parserContext);
			if (ruleTemplate == null) {
				throw new XmlParseException("Unknown Rule [" + ruleName + "].",
						node, context);
			}
		} else {
			List<Element> childElements = DomUtils.getChildElements(element);
			if (childElements.size() == 1) {
				ruleTemplate = (RuleTemplate) ruleTemplateParser.parse(
						childElements.get(0), parserContext);
				ruleName = ruleTemplate.getNodeName();
				if (StringUtils.isEmpty(ruleName)) {
					ruleName = ruleTemplate.getName();
				}
			} else {
				throw new XmlParseException("Rule undefined.", element, context);
			}
		}
		properties.put("ruleTemplate", ruleTemplate);

		if (StringUtils.isEmpty(name)) {
			name = ruleName;
		}

		ChildTemplate child = new ChildTemplate(name);

		String clientTypesText = (String) properties.remove("clientTypes");
		int clientTypes = ClientType.parseClientTypes(clientTypesText);
		if (clientTypes > 0) {
			child.setClientTypes(clientTypes);
		}

		BeanUtils.copyProperties(child, properties);
		return child;
	}

}
