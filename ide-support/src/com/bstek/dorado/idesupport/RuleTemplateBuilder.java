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

import java.io.FileNotFoundException;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.bstek.dorado.config.xml.XmlParser;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.core.pkgs.PackageInfo;
import com.bstek.dorado.core.xml.XmlDocumentBuilder;
import com.bstek.dorado.idesupport.initializer.InitializerContext;
import com.bstek.dorado.idesupport.initializer.RuleTemplateInitializer;
import com.bstek.dorado.idesupport.parse.ConfigRuleParseContext;
import com.bstek.dorado.idesupport.template.ChildTemplate;
import com.bstek.dorado.idesupport.template.RuleTemplate;
import com.bstek.dorado.util.PathUtils;
import com.bstek.dorado.util.clazz.ClassUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-11-18
 */
public class RuleTemplateBuilder implements RuleTemplateManagerListener {
	private XmlDocumentBuilder xmlDocumentBuilder;
	private XmlParser preloadParser;
	private XmlParser ruleTemplateParser;
	private Map<String, RuleTemplateInitializer> initializerNameMap = new LinkedHashMap<String, RuleTemplateInitializer>();
	private Map<Class<?>, RuleTemplateInitializer> initializerTypeMap = new LinkedHashMap<Class<?>, RuleTemplateInitializer>();

	private List<String> configTemplateFiles;

	private int initializingRuleTemplate = 0;
	private InitializerContext initializerContext;

	public void setXmlDocumentBuilder(XmlDocumentBuilder xmlDocumentBuilder) {
		this.xmlDocumentBuilder = xmlDocumentBuilder;
	}

	public void setConfigTemplateFiles(List<String> configTemplateFiles) {
		this.configTemplateFiles = configTemplateFiles;
	}

	public void setPreloadParser(XmlParser preloadParser) {
		this.preloadParser = preloadParser;
	}

	public void setRuleTemplateParser(XmlParser ruleTemplateParser) {
		this.ruleTemplateParser = ruleTemplateParser;
	}

	public void setInitializerMap(
			Map<String, RuleTemplateInitializer> initializerMap)
			throws ClassNotFoundException, LinkageError {
		this.initializerNameMap = new LinkedHashMap<String, RuleTemplateInitializer>();
		this.initializerTypeMap = new LinkedHashMap<Class<?>, RuleTemplateInitializer>();
		
		appendInitializerMap(initializerMap);
	}
	
	public void appendInitializerMap(
			Map<String, RuleTemplateInitializer> initializerMap) throws ClassNotFoundException {
		for (Map.Entry<String, RuleTemplateInitializer> entry : initializerMap
				.entrySet()) {
			String key = entry.getKey();
			RuleTemplateInitializer initialier = entry.getValue();
			if (initialier instanceof RuleTemplateBuilderAware) {
				((RuleTemplateBuilderAware) initialier)
						.setRuleTemplateBuilder(this);
			}

			if (key.startsWith("classType:")) {
				initializerTypeMap.put(ClassUtils.forName(key.substring(10)),
						initialier);
			} else {
				initializerNameMap.put(key, initialier);
			}
		}
	}

	@SuppressWarnings("unchecked")
	public  RuleTemplateManager getRuleTemplateManager()
			throws Exception {
		RuleTemplateManager ruleTemplateManager = new RuleTemplateManager();
		ruleTemplateManager.addListener(this);

		ConfigRuleParseContext parserContext = new ConfigRuleParseContext();
		parserContext.setRuleTemplateManager(ruleTemplateManager);

		for (String configTemplateFile : configTemplateFiles) {
			Document document = xmlDocumentBuilder
					.loadDocument(getResource(configTemplateFile));
			parseRuleConfigDocument(parserContext, document);
		}
		ruleTemplateManager.setVersion(Constants.RULE_CONFIG_VERSION);

		ruleTemplateManager.getPackageInfos().clear();
		List<PackageInfo> packageInfos = (List<PackageInfo>) parserContext
				.getAttributes().get("packageInfos");
		if (packageInfos != null) {
			ruleTemplateManager.getPackageInfos().addAll(packageInfos);
		}

		for (RuleTemplate ruleTemplate : parserContext.getRuleTemplateMap()
				.values()) {
			ruleTemplateManager.addRuleTemplate(ruleTemplate);
		}

		initRuleTemplates(ruleTemplateManager);
		return ruleTemplateManager;
	}

	private Resource getResource(String file) throws FileNotFoundException {
		Resource resource = Context.getCurrent().getResource(file);
		if (!resource.exists()) {
			throw new FileNotFoundException("File not exists - [" + resource
					+ "]");
		}
		return resource;
	}

	public void parseRuleConfigDocument(ConfigRuleParseContext parserContext,
			Document document) throws Exception {
		Element documentElement = document.getDocumentElement();
		parserContext.getRuleTemplateManager().setVersion(
				documentElement.getAttribute("version"));

		preloadParser.parse(documentElement, parserContext);

		Map<String, Element> ruleElementMap = parserContext.getRuleElementMap();
		for (String name : ruleElementMap.keySet().toArray(new String[0])) {
			Element element = ruleElementMap.get(name);
			ruleTemplateParser.parse(element, parserContext);
		}
	}

	protected void initRuleTemplates(RuleTemplateManager ruleTemplateManager)
			throws Exception {
		InitializerContext initializerContext = new InitializerContext(
				ruleTemplateManager);
		this.initializerContext = initializerContext;
		try {
			for (RuleTemplate ruleTemplate : ruleTemplateManager
					.getRuleTemplates().toArray(new RuleTemplate[0])) {
				initRuleTemplate(initializerContext, ruleTemplate);
			}
		} finally {
			this.initializerContext = null;
		}
	}

	public void initRuleTemplate(InitializerContext initializerContext,
			RuleTemplate ruleTemplate) throws Exception {
		if (ruleTemplate.isInitialized()) {
			return;
		}
		ruleTemplate.setInitialized(true);

		initializingRuleTemplate++;
		try {
			String parentName = null, parentNodeName = null;
			RuleTemplate[] parents = ruleTemplate.getParents();
			if (parents != null) {
				for (RuleTemplate parent : parents) {
					initRuleTemplate(initializerContext, parent);
					if (StringUtils.isNotEmpty(parent.getName())) {
						parentName = parent.getName();
					}
					if (StringUtils.isNotEmpty(parent.getNodeName())) {
						parentNodeName = parent.getNodeName();
					}
				}
			}

			if (StringUtils.isEmpty(ruleTemplate.getName())) {
				if (StringUtils.isEmpty(ruleTemplate.getNodeName())) {
					if (parentNodeName != null) {
						ruleTemplate.setNodeName(parentNodeName);
					} else if (parentName != null) {
						ruleTemplate.setNodeName(parentName);
					} else {
						throw new IllegalArgumentException(
								"Neither [name] nor [nodeName] is defined for the Rule.");
					}
				}
			}

			processInitializer(ruleTemplate, initializerContext);

			Collection<ChildTemplate> children = ruleTemplate.getChildren()
					.values();
			if (!children.isEmpty()) {
				for (ChildTemplate childTemplate : children) {
					initRuleTemplate(initializerContext,
							childTemplate.getRuleTemplate());
				}
			}
		} finally {
			initializingRuleTemplate--;
		}
	}

	protected void processInitializer(RuleTemplate ruleTemplate,
			InitializerContext initializerContext) throws Exception {
		String ruleName = ruleTemplate.getName();
		for (Map.Entry<String, RuleTemplateInitializer> entry : initializerNameMap
				.entrySet()) {
			if (PathUtils.match(entry.getKey(), ruleName)) {
				RuleTemplateInitializer initializer = entry.getValue();
				initializer.initRuleTemplate(ruleTemplate, initializerContext);
			}
		}

		String typeName = ruleTemplate.getType();
		Class<?> type = null;
		if (StringUtils.isNotEmpty(typeName)) {
			type = ClassUtils.forName(typeName);
		}
		if (type != null) {
			for (Map.Entry<Class<?>, RuleTemplateInitializer> entry : initializerTypeMap
					.entrySet()) {
				if (entry.getKey().isAssignableFrom(type)) {
					RuleTemplateInitializer initializer = entry.getValue();
					initializer.initRuleTemplate(ruleTemplate,
							initializerContext);
				}
			}
		}
	}

	public void ruleTemplateAdded(RuleTemplateManager ruleTemplateManager,
			RuleTemplate ruleTemplate) throws Exception {
		if (initializingRuleTemplate > 0 && ruleTemplate.isAutoInitialize()) {
			initRuleTemplate(initializerContext, ruleTemplate);
		}
	}

	public List<String> getConfigTemplateFiles() {
		return configTemplateFiles;
	}

}
