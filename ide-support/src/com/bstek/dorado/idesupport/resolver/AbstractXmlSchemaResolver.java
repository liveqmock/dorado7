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

package com.bstek.dorado.idesupport.resolver;

import com.bstek.dorado.idesupport.RuleSetBuilder;
import com.bstek.dorado.idesupport.RuleTemplateBuilder;
import com.bstek.dorado.idesupport.RuleTemplateManager;
import com.bstek.dorado.idesupport.model.RuleSet;
import com.bstek.dorado.web.DoradoContext;
import com.bstek.dorado.web.resolver.AbstractTextualResolver;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-3-31
 */
public abstract class AbstractXmlSchemaResolver extends AbstractTextualResolver {

	protected RuleSet getRuleSet(DoradoContext context) throws Exception {
		RuleTemplateBuilder ruleTemplateBuilder = (RuleTemplateBuilder) context
				.getServiceBean("idesupport.ruleTemplateBuilder");
		RuleSetBuilder ruleSetBuilder = (RuleSetBuilder) context
				.getServiceBean("idesupport.ruleSetBuilder");

		RuleTemplateManager ruleTemplateManager = ruleTemplateBuilder
				.getRuleTemplateManager();
		RuleSet ruleSet = ruleSetBuilder.buildRuleSet(ruleTemplateManager);
		return ruleSet;
	}
}
