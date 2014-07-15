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

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang.ArrayUtils;

import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.pkgs.PackageInfo;
import com.bstek.dorado.idesupport.model.Child;
import com.bstek.dorado.idesupport.model.CompositeType;
import com.bstek.dorado.idesupport.model.Property;
import com.bstek.dorado.idesupport.model.Rule;
import com.bstek.dorado.idesupport.model.RuleSet;
import com.bstek.dorado.idesupport.output.RuleSetOutputter;

public class RuleSetBuilderTest extends IdeSupportContextTestCase {

	protected RuleTemplateBuilder getRuleTemplateBuilder() throws Exception {
		Context context = Context.getCurrent();
		return (RuleTemplateBuilder) context
				.getServiceBean("idesupport.ruleTemplateBuilder");
	}

	protected RuleSetOutputter getRuleSetOutputter() throws Exception {
		Context context = Context.getCurrent();
		return (RuleSetOutputter) context
				.getServiceBean("idesupport.ruleSetOutputter");
	}

	public RuleSetBuilder getRuleSetBuilder() throws Exception {
		Context context = Context.getCurrent();
		return (RuleSetBuilder) context
				.getServiceBean("idesupport.ruleSetBuilder");
	}

	public void testOutputAndParse() throws Exception {
		RuleTemplateManager ruleTemplateManager = getRuleTemplateBuilder()
				.getRuleTemplateManager();

		byte[] byteArray = null;
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		Writer writer = new OutputStreamWriter(out);
		try {
			getRuleSetOutputter().output(writer, ruleTemplateManager);
			byteArray = out.toByteArray();
		} finally {
			writer.close();
			out.close();
		}

		assertNotNull(byteArray);
		InputStream in = new ByteArrayInputStream(byteArray);
		try {
			RuleSet ruleSet = getRuleSetBuilder().buildRuleSet(in);
			assertNotNull(ruleSet);
			assertFalse(ruleSet.getRuleMap().isEmpty());

			List<PackageInfo> packageInfos = ruleSet.getPackageInfos();
			assertNotNull(packageInfos);
			assertTrue(!packageInfos.isEmpty());

			Rule modelRule = ruleSet.getRule("Model");
			assertNotNull(modelRule);

			Map<String, Child> children = modelRule.getChildren();
			assertTrue(children.size() >= 3);

			Child dataTypeChild = children.get("DataType");
			Rule dataTypeRule = dataTypeChild.getRule();
			assertNotNull(dataTypeRule);
			assertEquals("DataType", dataTypeRule.getNodeName());

			Child dataProviderChild = children.get("DataProvider");
			Rule dataProviderRule = dataProviderChild.getRule();
			assertNotNull(dataProviderRule);

			Rule propertyDefRule = ruleSet.getRule("PropertyDef");
			assertNotNull(propertyDefRule);

			Child validatorChild = propertyDefRule.getChild("Validator");
			assertNotNull(validatorChild);
			System.out.println("Children of ValidotorRule: ");
			Set<Rule> validatorRules = validatorChild.getConcreteRules();
			for (Rule validatorRule : validatorRules) {
				System.out.println(validatorRule.getName() + " : "
						+ validatorRule.getNodeName());
			}

			Property mappingProperty = propertyDefRule.getProperty("mapping");
			assertNotNull(mappingProperty);
			assertTrue(mappingProperty.getCompositeType() == CompositeType.Fixed);
			assertEquals(3, mappingProperty.getProperties().size());

			Rule buttonRule = ruleSet.getRule("Button");
			assertNotNull(buttonRule);
			Property property = buttonRule.getProperty("action");
			assertNotNull(property);
			assertEquals("Action", property.getReference().getRule().getName());

			Rule abstractButtonRule = ruleSet.getRule("AbstractButton");
			assertNotNull(abstractButtonRule);
			assertTrue(ArrayUtils.indexOf(buttonRule.getParents(),
					abstractButtonRule) >= 0);

			boolean hasButtonRule = false;
			Rule[] concretButtonRules = abstractButtonRule.getSubRules();
			for (Rule concretButtonRule : concretButtonRules) {
				String name = concretButtonRule.getName();
				if ("Button".equals(name)) {
					hasButtonRule = true;
				}
			}
			assertTrue(hasButtonRule);

			Rule controlRule = ruleSet.getRule("Control_1");
			assertNotNull(controlRule);
			assertTrue(ArrayUtils.indexOf(abstractButtonRule.getParents(),
					controlRule) >= 0);

			boolean hasAbstractButtonRule = false;
			Rule[] concretControlRules = controlRule.getSubRules();
			for (Rule concretControlRule : concretControlRules) {
				String name = concretControlRule.getName();
				if ("AbstractButton".equals(name)) {
					hasAbstractButtonRule = true;
				}
			}
			assertTrue(hasAbstractButtonRule);

			Rule floatPanelRule = ruleSet.getRule("FloatPanel");
			assertNotNull(floatPanelRule);
			assertNotNull(floatPanelRule.getChild("Children"));
			assertNotNull(floatPanelRule.getChild("Tools"));
			assertNotNull(floatPanelRule.getChild("Buttons"));

			Property animateTargetProperty = floatPanelRule
					.getProperty("animateTarget");
			assertNotNull(animateTargetProperty);
			assertFalse(animateTargetProperty.isVisible());

			Rule viewRule = ruleSet.getRule("View");
			for (Child child : viewRule.getChildren().values()) {
				Rule childRule = child.getRule();
				System.out.println(childRule.getName() + " : "
						+ childRule.getNodeName());
			}

			Rule dataTreeGridRule = ruleSet.getRule("DataTreeGrid");
			assertNotNull(dataTreeGridRule);
			property = dataTreeGridRule.getProperty("dataSet");
			assertNotNull(property);
			assertEquals("DataSet", property.getReference().getRule().getName());

			Rule treeRule = ruleSet.getRule("Tree");
			assertNotNull(treeRule);

			Rule customDropDownRule = ruleSet.getRule("CustomDropDown");
			assertNotNull(customDropDownRule);

			Child child = customDropDownRule.getChild("Control");
			assertNotNull(child);

			System.out.println("Children of CustomDropDown: ");
			Set<Rule> concreteRules = child.getConcreteRules();
			for (Rule concreteRule : concreteRules) {
				System.out.println(concreteRule.getName() + " : "
						+ concreteRule.getNodeName());
			}
		} finally {
			in.close();
		}
	}
}
