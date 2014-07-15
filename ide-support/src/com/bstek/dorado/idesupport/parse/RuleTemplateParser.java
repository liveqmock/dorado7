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
import java.util.Collection;
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
import com.bstek.dorado.idesupport.model.ClientEvent;
import com.bstek.dorado.idesupport.template.ChildTemplate;
import com.bstek.dorado.idesupport.template.PropertyTemplate;
import com.bstek.dorado.idesupport.template.RuleTemplate;
import com.bstek.dorado.util.xml.DomUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-11-18
 */
public class RuleTemplateParser extends ConfigurableDispatchableXmlParser {

	private boolean global;

	public boolean isGlobal() {
		return global;
	}

	public void setGlobal(boolean global) {
		this.global = global;
	}

	public RuleTemplate getRuleTemplate(String name,
			ConfigRuleParseContext parserContext) throws Exception {
		RuleTemplate ruleTemplate = parserContext.getRuleTemplateMap()
				.get(name);
		if (ruleTemplate == null) {
			Element element = parserContext.getRuleElementMap().get(name);
			if (element != null) {
				ruleTemplate = (RuleTemplate) parse(element, parserContext);
			}
		}
		return ruleTemplate;
	}

	@Override
	@SuppressWarnings("unchecked")
	protected Object doParse(Node node, ParseContext context) throws Exception {
		Element element = (Element) node;
		ConfigRuleParseContext parserContext = (ConfigRuleParseContext) context;
		RuleTemplate ruleTemplate;
		String name = element.getAttribute("name");

		if (StringUtils.isNotBlank(name)) {
			ruleTemplate = parserContext.getRuleTemplateMap().get(name);
			if (ruleTemplate != null) {
				return ruleTemplate;
			}
		}
		if (StringUtils.isBlank(name)) {
			if (global) {
				throw new XmlParseException(
						"The global rule's 'name' attribute can not be blank.",
						node, context);
			} else {
				name = element.getAttribute("nodeName");
				if (StringUtils.isBlank(name)) {
					throw new XmlParseException(
							"The 'name' attribute and the 'nodeName' attribute can not be blank at the same time.",
							node, context);
				}
			}
		}

		ruleTemplate = new RuleTemplate(name);
		if (global) {
			parserContext.getRuleTemplateMap().put(name, ruleTemplate);
			ruleTemplate.setGlobal(true);
		}

		Map<String, Object> properties = parseProperties(element, context);

		String[] parents = (String[]) properties.remove("parents");
		if (parents != null) {
			List<RuleTemplate> parentList = new ArrayList<RuleTemplate>();
			for (String parentName : parents) {
				RuleTemplate parent = getRuleTemplate(parentName, parserContext);
				if (parent != null)
					parentList.add(parent);
			}
			properties.put("parents", parentList.toArray(new RuleTemplate[0]));
		}

		String clientTypesText = (String) properties.remove("clientTypes");
		int clientTypes = ClientType.parseClientTypes(clientTypesText);
		if (clientTypes > 0) {
			ruleTemplate.setClientTypes(clientTypes);
		}

		BeanUtils.copyProperties(ruleTemplate, properties);

		Element primitivePropsEl = DomUtils.getChildByTagName(element,
				"PrimitiveProps");
		if (primitivePropsEl != null) {
			ruleTemplate
					.addPrimitiveProperties((Collection<PropertyTemplate>) dispatchChildElements(
							primitivePropsEl, parserContext));
		}

		Element propsEl = DomUtils.getChildByTagName(element, "Props");
		if (propsEl != null) {
			ruleTemplate
					.addProperties((Collection<PropertyTemplate>) dispatchChildElements(
							propsEl, parserContext));
		}

		Element eventsEl = DomUtils.getChildByTagName(element, "ClientEvents");
		if (eventsEl != null) {
			ruleTemplate
					.addClientEvents((Collection<ClientEvent>) dispatchChildElements(
							eventsEl, parserContext));
		}

		Element childrenEl = DomUtils.getChildByTagName(element, "Children");
		if (childrenEl != null) {
			ruleTemplate
					.addChildren((Collection<ChildTemplate>) dispatchChildElements(
							childrenEl, parserContext));
		}
		return ruleTemplate;
	}
}
