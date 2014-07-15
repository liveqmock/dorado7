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

package com.bstek.dorado.view.manager;

import com.bstek.dorado.config.definition.DefinitionManager;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.data.config.definition.DataProviderDefinition;
import com.bstek.dorado.data.config.definition.DataTypeDefinition;
import com.bstek.dorado.view.ViewContextTestCase;
import com.bstek.dorado.view.config.ViewConfigDefinitionFactory;
import com.bstek.dorado.view.config.XmlViewConfigDefinitionFactory;
import com.bstek.dorado.view.config.definition.ComponentDefinition;
import com.bstek.dorado.view.config.definition.ViewConfigDefinition;
import com.bstek.dorado.view.config.definition.ViewDefinition;

public class ConfigurableViewConfigManagerTest extends ViewContextTestCase {

	public void testViewNameResolving() throws Exception {
		ConfigurableViewConfigManager viewConfigManager = new ConfigurableViewConfigManager();
		ViewConfigDefinitionFactory vf1 = new XmlViewConfigDefinitionFactory();
		ViewConfigDefinitionFactory vf2 = new XmlViewConfigDefinitionFactory();
		viewConfigManager.registerViewConfigFactory("abc/*", vf1);
		viewConfigManager.registerViewConfigFactory("**/*", vf2);

		assertSame(vf1, viewConfigManager.getViewConfigFactory("abc/view"));
		assertSame(vf2, viewConfigManager.getViewConfigFactory("abc/def/view"));
		assertSame(vf2, viewConfigManager.getViewConfigFactory("def/view"));
	}

	private ViewConfigManager getViewConfigManager() throws Exception {
		Context context = Context.getCurrent();
		ViewConfigManager viewConfigManager = (ViewConfigManager) context
				.getServiceBean("viewConfigManager");
		return viewConfigManager;
	}

	public void testInnerDataObject() throws Exception {
		ViewConfigManager viewConfigManager = getViewConfigManager();

		String viewName = "com/bstek/dorado/view/config/xml/TestView1";
		ViewConfigDefinitionFactory viewDefinitionFactory = (ViewConfigDefinitionFactory) viewConfigManager
				.getViewConfigFactory(viewName);
		ViewConfigDefinition viewConfigDefinition = viewDefinitionFactory
				.create(viewName);
		assertNotNull(viewConfigDefinition);

		DefinitionManager<DataTypeDefinition> dataTypeDefinitionManager = viewConfigDefinition
				.getDataTypeDefinitionManager();
		assertFalse(dataTypeDefinitionManager.getDefinitions().isEmpty());

		DefinitionManager<DataProviderDefinition> dataProviderDefinitionManager = viewConfigDefinition
				.getDataProviderDefinitionManager();
		assertFalse(dataProviderDefinitionManager.getDefinitions().isEmpty());

		ViewDefinition viewDefinition = viewConfigDefinition
				.getViewDefinition();
		ComponentDefinition component;

		component = viewDefinition.getComponent("ds1");
		assertNotNull(component);

		component = viewDefinition.getComponent("ds2");
		assertNotNull(component);
	}
}
