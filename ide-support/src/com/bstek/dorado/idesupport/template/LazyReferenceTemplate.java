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

package com.bstek.dorado.idesupport.template;

import com.bstek.dorado.idesupport.RuleTemplateManager;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-8-1
 */
public class LazyReferenceTemplate extends ReferenceTemplate {
	private RuleTemplateManager ruleTemplateManager;
	private String ruleName;
	private RuleTemplate ruleTemplate;

	public LazyReferenceTemplate(RuleTemplateManager ruleTemplateManager,
			String ruleName, String property) {
		super(property);
		this.ruleTemplateManager = ruleTemplateManager;
		this.ruleName = ruleName;
	}

	@Override
	public RuleTemplate getRuleTemplate() {
		if (ruleTemplate == null) {
			ruleTemplate = ruleTemplateManager.getRuleTemplate(ruleName);
		}
		return ruleTemplate;
	}

}
