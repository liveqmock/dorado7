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

import com.bstek.dorado.core.Context;
import com.bstek.dorado.idesupport.template.RuleTemplate;

public class RuleTemplateBuilderTest extends IdeSupportContextTestCase {

	protected RuleTemplateBuilder getRuleTemplateBuilder() throws Exception {
		Context context = Context.getCurrent();
		return (RuleTemplateBuilder) context
				.getServiceBean("idesupport.ruleTemplateBuilder");
	}

	public void test() throws Exception {
		RuleTemplateBuilder configRuleTemplateManager = getRuleTemplateBuilder();
		RuleTemplateManager ruleTemplateManager = configRuleTemplateManager
				.getRuleTemplateManager();
		assertNotNull(ruleTemplateManager);

		RuleTemplate dataTypeTemplate = ruleTemplateManager
				.getRuleTemplate("DataType");
		assertNotNull(dataTypeTemplate);
		assertEquals("com.bstek.dorado.data.type.DefaultEntityDataType",
				dataTypeTemplate.getType());

		RuleTemplate dataProviderTemplate = ruleTemplateManager
				.getRuleTemplate("AbstractDataProvider");
		assertNotNull(dataProviderTemplate);

		RuleTemplate layoutHolderTemplate = ruleTemplateManager
				.getRuleTemplate("LayoutHolder");
		assertNotNull(layoutHolderTemplate);

		RuleTemplate updateActionTemplate = ruleTemplateManager
				.getRuleTemplate("UpdateAction");
		assertNotNull(updateActionTemplate);

		RuleTemplate treeTemplate = ruleTemplateManager.getRuleTemplate("Tree");
		assertNotNull(treeTemplate);
	}
}
