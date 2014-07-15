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

package com.bstek.dorado.idesupport.initializer;

import javassist.Modifier;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.idesupport.RuleTemplateManager;
import com.bstek.dorado.idesupport.template.AutoRuleTemplate;
import com.bstek.dorado.idesupport.template.RuleTemplate;
import com.bstek.dorado.util.clazz.ClassUtils;
import com.bstek.dorado.view.widget.FloatControl;

public class FloatControlRuleTemplateInitializer implements
		RuleTemplateInitializer {

	public void initRuleTemplate(RuleTemplate ruleTemplate,
			InitializerContext initializerContext) throws Exception {
		String typeName = ruleTemplate.getType();
		if (StringUtils.isNotEmpty(typeName)) {
			Class<?> type = ClassUtils.forName(typeName);
			if (type.equals(FloatControl.class)
					|| Modifier.isAbstract(type.getModifiers())) {
				return;
			}

			boolean found = false;
			for (Class<?> _interface : type.getInterfaces()) {
				if (_interface.equals(FloatControl.class)) {
					found = true;
					break;
				}
			}
			if (!found) {
				return;
			}
		}

		RuleTemplateManager ruleTemplateManager = initializerContext
				.getRuleTemplateManager();
		RuleTemplate floatControlRule = ruleTemplateManager
				.getRuleTemplate("FloatControl");
		if (floatControlRule == null) {
			floatControlRule = new AutoRuleTemplate("FloatControl",
					FloatControl.class.getName());
			floatControlRule.setAbstract(true);
			ruleTemplateManager.addRuleTemplate(floatControlRule);
		}

		RuleTemplate[] parents = ruleTemplate.getParents();
		if (parents != null) {
			RuleTemplate[] oldParents = parents;
			parents = new RuleTemplate[oldParents.length + 1];
			System.arraycopy(oldParents, 0, parents, 0, oldParents.length);
			parents[oldParents.length] = floatControlRule;
		} else {
			parents = new RuleTemplate[] { floatControlRule };
		}
		ruleTemplate.setParents(parents);
	}

}
