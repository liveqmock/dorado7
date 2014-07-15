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

import java.util.LinkedHashMap;
import java.util.Map;

import org.w3c.dom.Element;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.idesupport.RuleTemplateManager;
import com.bstek.dorado.idesupport.template.RuleTemplate;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-11-18
 */
public class ConfigRuleParseContext extends ParseContext {
	private Map<String, Element> ruleElementMap = new LinkedHashMap<String, Element>();
	private Map<String, RuleTemplate> ruleTemplateMap = new LinkedHashMap<String, RuleTemplate>();
	private RuleTemplateManager ruleTemplateManager;

	public Map<String, Element> getRuleElementMap() {
		return ruleElementMap;
	}

	public Map<String, RuleTemplate> getRuleTemplateMap() {
		return ruleTemplateMap;
	}

	public RuleTemplateManager getRuleTemplateManager() {
		return ruleTemplateManager;
	}

	public void setRuleTemplateManager(RuleTemplateManager ruleTemplateManager) {
		this.ruleTemplateManager = ruleTemplateManager;
	}
}
