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

import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.InputStream;
import java.util.Set;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.core.Context;
import com.bstek.dorado.idesupport.model.Child;
import com.bstek.dorado.idesupport.model.Property;
import com.bstek.dorado.idesupport.model.Rule;
import com.bstek.dorado.idesupport.model.RuleSet;
import com.bstek.dorado.idesupport.output.RuleSetOutputter;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-11-25
 */
public class StandaloneRuleSetBuilderTest extends IdeSupportContextTestCase {

	private RuleTemplateBuilder getRuleTemplateBuilder() throws Exception {
		Context context = Context.getCurrent();
		return (RuleTemplateBuilder) context
				.getServiceBean("idesupport.ruleTemplateBuilder");
	}

	private RuleSetOutputter getRuleSetOutputter() throws Exception {
		Context context = Context.getCurrent();
		return (RuleSetOutputter) context
				.getServiceBean("idesupport.ruleSetOutputter");
	}

	private String outputTemplateToFile() throws Exception {
		RuleTemplateManager ruleTemplateManager = getRuleTemplateBuilder()
				.getRuleTemplateManager();
		// File file = File.createTempFile("rules", "xml");
		File file = new File("e:/temp/rule.xml");
		getRuleSetOutputter().output(new FileWriter(file), ruleTemplateManager);
		return file.getAbsolutePath();
	}

	public void test() throws Exception {
		String path = outputTemplateToFile();

		InputStream in = new FileInputStream(path);
		RuleSet ruleSet = StandaloneRuleSetBuilder.getRuleSet(in);
		assertNotNull(ruleSet);
		assertFalse(ruleSet.getRuleMap().isEmpty());

		for (Rule rule : ruleSet.getRuleMap().values()) {
			rule.getPrimitiveProperties();
		}

		Rule modelRule = ruleSet.getRule("Model");
		assertNotNull(modelRule);

		Child dataTypeChild = modelRule.getChild("DataType");
		assertNotNull(dataTypeChild);

		Rule dataTypeRule = ruleSet.getRule("DataType");
		assertNotNull(dataTypeRule);
		assertEquals("DataType", dataTypeRule.getNodeName());
		assertFalse(dataTypeRule.isAbstract());

		Child propertyDef = dataTypeRule.getChild("PropertyDef");
		assertNotNull(propertyDef);

		Rule referenceRule = ruleSet.getRule("Reference");
		assertEquals("pojo", referenceRule.getProperty("parameter").getEditor());

		Set<Rule> concreteRules = propertyDef.getConcreteRules();
		assertNotNull(concreteRules);

		Property primitiveProperty = dataTypeRule.getPrimitiveProperty("impl");
		assertNotNull(primitiveProperty);

		Rule directDataProviderRule = ruleSet.getRule("DirectDataProvider");
		assertNotNull(directDataProviderRule);
		assertEquals("DataProvider", directDataProviderRule.getNodeName());
		assertEquals("DirectDataProvider", directDataProviderRule.getLabel());
		assertFalse(directDataProviderRule.isAbstract());

		primitiveProperty = directDataProviderRule.getPrimitiveProperty("impl");
		assertNotNull(primitiveProperty);

		Rule[] subRules = dataTypeChild.getRule().getSubRules();
		assertNotNull(subRules);

		Rule viewRule = ruleSet.getRule("View");
		assertNotNull(viewRule);

		assertNotNull(ruleSet.getRule("AnchorLayout"));
		assertNotNull(ruleSet.getRule("LayoutHolder"));
		assertNotNull(ruleSet.getRule("DataSet"));
		assertNotNull(ruleSet.getRule("UpdateAction"));

		Rule componentRule = ruleSet.getRule("Component");
		Rule controlRule = ruleSet.getRule("Control_1");
		Rule defaultControlRule = ruleSet.getRule("Control");
		Rule containerRule = ruleSet.getRule("Container");
		Rule datasetRule = ruleSet.getRule("DataSet");
		Rule panelRule = ruleSet.getRule("Panel");
		Rule buttonRule = ruleSet.getRule("Button");
		Rule autoFormRule = ruleSet.getRule("AutoForm");
		Rule toolBarRule = ruleSet.getRule("ToolBar");

		assertTrue(datasetRule.isSubRuleOf(componentRule));
		assertTrue(controlRule.isSubRuleOf(componentRule));
		assertTrue(containerRule.isSubRuleOf(componentRule));
		assertTrue(buttonRule.isSubRuleOf(componentRule));
		assertTrue(buttonRule.isSubRuleOf(controlRule));
		assertTrue(autoFormRule.isSubRuleOf(controlRule));

		assertFalse(datasetRule.isSubRuleOf(controlRule));
		assertFalse(componentRule.isSubRuleOf(controlRule));
		assertTrue(StringUtils.isNotBlank(defaultControlRule.getIcon()));

		Property layoutProperty = containerRule.getProperty("layout");
		assertNotNull(layoutProperty);
		assertFalse(layoutProperty.isVisible());

		Property idProperty = viewRule.getPrimitiveProperty("id");
		assertNotNull(idProperty);
		assertFalse(idProperty.isVisible());

		assertEquals("Button", buttonRule.getNodeName());

		Set<Rule> componentRules = containerRule.getChild("Children")
				.getConcreteRules();
		assertFalse(componentRules.contains(viewRule));

		Rule label1Rule = ruleSet.getRule("Label_1");
		assertNotNull(label1Rule);
		assertEquals("ToolBarLabel", label1Rule.getNodeName());

		Rule toolBarButtonRule = ruleSet.getRule("Button_1");
		assertNotNull(toolBarButtonRule);
		assertEquals("ToolBar", toolBarButtonRule.getCategory());
		assertFalse(componentRules.contains(toolBarButtonRule));

		Set<Rule> concreteToolBarRules = toolBarRule.getChild("Items")
				.getConcreteRules();
		assertFalse(concreteToolBarRules
				.contains(ruleSet.getRule("MenuButton")));
		assertFalse(concreteToolBarRules.contains(ruleSet
				.getRule("AutoFormElement")));
		assertTrue(concreteToolBarRules.contains(ruleSet.getRule("TextEditor")));

		Set<Rule> concreteToolBarButtonRules = toolBarRule.getChild(
				"ToolBarButton").getConcreteRules();
		assertEquals(1, concreteToolBarButtonRules.size());

		assertNotNull(viewRule.getPrimitiveProperty("listener"));
		assertNotNull(datasetRule.getPrimitiveProperty("id"));
		assertNotNull(panelRule.getPrimitiveProperty("id"));

		Child child = autoFormRule.getChild("AutoFormElement");
		assertNotNull(child);

		Rule dataColumnRule = ruleSet.getRule("DataColumn");
		assertNotNull(dataColumnRule);
		assertEquals("DataColumn", dataColumnRule.getNodeName());

		Rule separator1Rule = ruleSet.getRule("Separator_1");
		assertEquals("Separator", separator1Rule.getNodeName());

		Rule treeGridRule = ruleSet.getRule("TreeGrid");
		assertNotNull(treeGridRule);
		Set<Rule> concreteRules2 = treeGridRule.getChild("Column").getRule()
				.getChild("Column").getConcreteRules();
		assertTrue(concreteRules2.size() > 4);

		Rule tabBarRule = ruleSet.getRule("TabBar");
		assertEquals(1, tabBarRule.getChildren().size());

		Rule tabControlRule = ruleSet.getRule("TabControl");
		assertEquals(2, tabControlRule.getChildren().size());

		Rule lengthValidatorRule = ruleSet.getRule("LengthValidator");
		assertTrue(StringUtils.isNotBlank(lengthValidatorRule.getIcon()));

		Rule menuButtonRule = ruleSet.getRule("MenuButton");
		assertFalse(menuButtonRule.getProperty("menu").isVisible());

		Rule dataLabelRule = ruleSet.getRule("DataLabel");
		assertTrue(dataLabelRule.isDeprecated());
	}

	public void testLoadRuleFile() throws Exception {
		InputStream in = new FileInputStream("e:/temp/rules.xml");
		StandaloneRuleSetBuilder.getRuleSet(in);
	}
}
