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

package com.bstek.dorado.idesupport;

import java.io.InputStream;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.lang.StringUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.bstek.dorado.config.xml.XmlParser;
import com.bstek.dorado.core.io.InputStreamResource;
import com.bstek.dorado.core.pkgs.PackageInfo;
import com.bstek.dorado.core.xml.XmlDocumentBuilder;
import com.bstek.dorado.idesupport.model.Child;
import com.bstek.dorado.idesupport.model.ClientEvent;
import com.bstek.dorado.idesupport.model.CompositeType;
import com.bstek.dorado.idesupport.model.Property;
import com.bstek.dorado.idesupport.model.Reference;
import com.bstek.dorado.idesupport.model.Rule;
import com.bstek.dorado.idesupport.model.RuleSet;
import com.bstek.dorado.idesupport.parse.ConfigRuleParseContext;
import com.bstek.dorado.idesupport.template.ChildTemplate;
import com.bstek.dorado.idesupport.template.PropertyTemplate;
import com.bstek.dorado.idesupport.template.ReferenceTemplate;
import com.bstek.dorado.idesupport.template.RuleTemplate;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-11-22
 */
public class RuleSetBuilder {
	private XmlDocumentBuilder xmlDocumentBuilder;
	private XmlParser preloadParser;
	private XmlParser ruleTemplateParser;

	public void setXmlDocumentBuilder(XmlDocumentBuilder xmlDocumentBuilder) {
		this.xmlDocumentBuilder = xmlDocumentBuilder;
	}

	public void setPreloadParser(XmlParser preloadParser) {
		this.preloadParser = preloadParser;
	}

	public void setRuleTemplateParser(XmlParser ruleTemplateParser) {
		this.ruleTemplateParser = ruleTemplateParser;
	}

	public RuleSet buildRuleSet(InputStream in) throws Exception {
		Document document = xmlDocumentBuilder
				.loadDocument(new InputStreamResource(in));

		RuleTemplateManager ruleTemplateManager = new RuleTemplateManager();
		ConfigRuleParseContext parserContext = new ConfigRuleParseContext();
		parserContext.setRuleTemplateManager(ruleTemplateManager);

		Element documentElement = document.getDocumentElement();
		preloadParser.parse(documentElement, parserContext);

		Map<String, Element> ruleElementMap = parserContext.getRuleElementMap();
		for (String name : ruleElementMap.keySet().toArray(new String[0])) {
			Element element = ruleElementMap.get(name);
			ruleTemplateParser.parse(element, parserContext);
		}

		for (RuleTemplate ruleTemplate : parserContext.getRuleTemplateMap()
				.values()) {
			ruleTemplateManager.addRuleTemplate(ruleTemplate);
		}

		return buildRuleSet(ruleTemplateManager);
	}

	public RuleSet buildRuleSet(RuleTemplateManager ruleTemplateManager)
			throws Exception {
		RuleSet ruleSet = new RuleSet();
		ruleSet.setVersion(ruleTemplateManager.getVersion());

		List<PackageInfo> packageInfos = ruleTemplateManager.getPackageInfos();
		if (packageInfos != null) {
			ruleSet.getPackageInfos().addAll(packageInfos);
		}

		for (RuleTemplate ruleTemplate : ruleTemplateManager.getRuleTemplates()) {
			if (ruleSet.getRule(ruleTemplate.getName()) == null) {
				exportRule(ruleTemplate, ruleSet);
			}
		}
		return ruleSet;
	}

	protected Rule exportRule(RuleTemplate ruleTemplate, RuleSet ruleSet)
			throws Exception {
		Rule rule;
		String name = ruleTemplate.getName();
		if (StringUtils.isNotEmpty(name)) {
			rule = ruleSet.getRule(name);
			if (rule != null)
				return rule;
		}

		rule = new Rule(name);
		if (ruleTemplate.isGlobal()) {
			ruleSet.addRule(rule);
		}

		RuleTemplate[] parentTemplates = ruleTemplate.getParents();
		if (parentTemplates != null && parentTemplates.length > 0) {
			Rule[] parents = new Rule[parentTemplates.length];
			for (int i = 0; i < parentTemplates.length; i++) {
				RuleTemplate parentTemplate = parentTemplates[i];
				parents[i] = exportRule(parentTemplate, ruleSet);
			}
			rule.setParents(parents);
		}
		ruleTemplate.processInheritance();

		applyTemplateToRule(ruleTemplate, rule, ruleSet);
		return rule;
	}

	protected void applyTemplateToRule(RuleTemplate ruleTemplate, Rule rule,
			RuleSet ruleSet) throws Exception {
		applyProperties(
				ruleTemplate,
				rule,
				"label,abstract,nodeName,type,category,robots,icon,labelProperty,autoGenerateId,clientTypes,reserve,deprecated,visible");

		if (StringUtils.isEmpty(rule.getNodeName())) {
			if (StringUtils.isNotEmpty(rule.getType())) {
				String type = rule.getType();
				rule.setNodeName(StringUtils.substringAfterLast(type, "."));
			} else {
				rule.setNodeName(rule.getName());
			}
		}

		if (StringUtils.isEmpty(rule.getLabel())) {
			rule.setLabel(rule.getNodeName());
		}

		if (ruleTemplate.getSortFactor() > 0) {
			rule.setSortFactor(ruleTemplate.getSortFactor());
		}

		Map<String, PropertyTemplate> primitiveProperties = ruleTemplate
				.getFinalPrimitiveProperties();
		if (!primitiveProperties.isEmpty()) {
			for (PropertyTemplate propertyTemplate : primitiveProperties
					.values()) {
				Property property = new Property();
				applyTemplateToProperty(propertyTemplate, property, ruleSet);
				rule.addPrimitiveProperty(property);
			}
		}

		Map<String, PropertyTemplate> properties = ruleTemplate
				.getFinalProperties();
		if (!properties.isEmpty()) {
			for (PropertyTemplate propertyTemplate : properties.values()) {
				Property property = new Property();
				applyTemplateToProperty(propertyTemplate, property, ruleSet);
				rule.addProperty(property);
			}
		}

		Map<String, ClientEvent> clientEvents = ruleTemplate
				.getFinalClientEvents();
		if (!clientEvents.isEmpty()) {
			rule.addClientEvents(clientEvents.values());
		}

		Collection<ChildTemplate> children = ruleTemplate.getFinalChildren()
				.values();
		if (!children.isEmpty()) {
			for (ChildTemplate childTemplate : children) {
				addChildrenByChildTemplate(rule, childTemplate, ruleSet);
			}
		}
	}

	protected void applyTemplateToProperty(PropertyTemplate propertyTemplate,
			Property property, RuleSet ruleSet) throws Exception {
		applyProperties(
				propertyTemplate,
				property,
				"name,type,defaultValue,fixed,enumValues,editor,highlight,visible,compositeType,clientTypes,reserve,deprecated");

		ReferenceTemplate referenceTemplate = propertyTemplate.getReference();
		if (referenceTemplate != null) {
			Rule rule = exportRule(referenceTemplate.getRuleTemplate(), ruleSet);
			property.setReference(new Reference(rule, referenceTemplate
					.getProperty()));
		}

		if (property.getCompositeType() == CompositeType.Fixed
				|| property.getCompositeType() == CompositeType.Open) {
			Map<String, PropertyTemplate> properties = propertyTemplate
					.getProperties();
			for (Map.Entry<String, PropertyTemplate> entry : properties
					.entrySet()) {
				PropertyTemplate subPopertyTemplate = entry.getValue();
				if (!subPopertyTemplate.isVisible()) {
					continue;
				}

				Property subPoperty = new Property();
				applyTemplateToProperty(subPopertyTemplate, subPoperty, ruleSet);
				property.addProperty(subPoperty);
			}
		}
	}

	private void findConcreteRules(RuleTemplate ruleTemplate,
			Set<Rule> concreteRules, RuleSet ruleSet, boolean validateScope)
			throws Exception {
		RuleTemplate[] subRuleTemplates = ruleTemplate.getSubRuleTemplates();
		if (subRuleTemplates != null && subRuleTemplates.length > 0) {
			for (RuleTemplate subRuleTemplate : subRuleTemplates) {
				String scope = subRuleTemplate.getScope();
				if (validateScope && "private".equals(scope)) {
					continue;
				}

				if (!subRuleTemplate.isAbstract()
						&& (!validateScope || StringUtils.isEmpty(scope) || "public"
								.equals(scope))) {
					concreteRules.add(exportRule(subRuleTemplate, ruleSet));
				}

				findConcreteRules(subRuleTemplate, concreteRules, ruleSet,
						validateScope);
			}
		}
	}

	protected void addChildrenByChildTemplate(Rule rule,
			ChildTemplate childTemplate, RuleSet ruleSet) throws Exception {
		RuleTemplate childRuleTemplate = childTemplate.getRuleTemplate();
		// if (!childTemplate.isVisible() || !childRuleTemplate.isVisible()) {
		// return;
		// }

		Child child = new Child(childTemplate.getName());
		applyTemplateToChild(childTemplate, child, ruleSet);
		rule.addChild(child);

		Set<Rule> concreteRules = child.getConcreteRules();
		if (!childRuleTemplate.isAbstract()) {
			concreteRules.add(exportRule(childRuleTemplate, ruleSet));
		}
		findConcreteRules(childRuleTemplate, concreteRules, ruleSet, true);
	}

	protected void applyTemplateToChild(ChildTemplate childTemplate,
			Child child, RuleSet ruleSet) throws Exception {
		Rule rule = exportRule(childTemplate.getRuleTemplate(), ruleSet);
		child.setRule(rule);
		applyProperties(childTemplate, child,
				"fixed,aggregated,clientTypes,deprecated,reserve");
		if (childTemplate.isDeprecated()) {
			child.setDeprecated(true);
		}
	}

	private void applyProperties(Object source, Object target,
			String propertyNames) throws Exception {
		if (StringUtils.isNotEmpty(propertyNames)) {
			for (String propertyName : StringUtils.split(propertyNames, ',')) {
				applyProperty(source, target, propertyName);
			}
		}
	}

	private void applyProperty(Object source, Object target, String propertyName)
			throws Exception {
		Object value = PropertyUtils.getProperty(source, propertyName);
		if (value != null) {
			PropertyUtils.setProperty(target, propertyName, value);
		}
	}

}
