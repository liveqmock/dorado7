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

import com.bstek.dorado.core.Context;
import com.bstek.dorado.data.provider.DataProvider;
import com.bstek.dorado.data.type.AggregationDataType;
import com.bstek.dorado.data.type.EntityDataType;
import com.bstek.dorado.data.type.property.PropertyDef;
import com.bstek.dorado.view.View;
import com.bstek.dorado.view.ViewContextTestCase;
import com.bstek.dorado.view.widget.data.DataSet;

public class DefaultViewConfigManagerTest extends ViewContextTestCase {

	private ViewConfigManager getViewConfigManager() throws Exception {
		Context context = Context.getCurrent();
		ViewConfigManager viewConfigManager = (ViewConfigManager) context
				.getServiceBean("viewConfigManager");
		return viewConfigManager;
	}

	private ViewConfig getTestViewConfig() throws Exception {
		ViewConfigManager viewConfigManager = getViewConfigManager();
		ViewConfig viewConfig = viewConfigManager
				.getViewConfig("com/bstek/dorado/view/config/xml/TestView1");
		return viewConfig;
	}

	public void test1() throws Exception {
		ViewConfig viewConfig = getTestViewConfig();
		assertNotNull(viewConfig);

		View view = viewConfig.getView();
		DataSet ds1 = (DataSet) view.getViewElement("ds1");
		assertNotNull(ds1);

		DataProvider dataProvider = ds1.getDataProvider();
		assertNotNull(dataProvider);
		assertEquals("testProvider1", dataProvider.getName());

		AggregationDataType resultDataType = (AggregationDataType) dataProvider
				.getResultDataType();
		assertNotNull(resultDataType);
	}

	public void test2() throws Exception {
		ViewConfig viewConfig = getTestViewConfig();
		assertNotNull(viewConfig);

		View view = viewConfig.getView();

		DataSet ds2 = (DataSet) view.getViewElement("ds2");
		assertNotNull(ds2);

		DataProvider dataProvider = ds2.getDataProvider();
		assertNotNull(dataProvider);
		assertFalse("testProvider1".equals(dataProvider.getName()));

		AggregationDataType resultDataType = (AggregationDataType) dataProvider
				.getResultDataType();
		assertNotNull(resultDataType);

		EntityDataType entityDataType = (EntityDataType) resultDataType
				.getElementDataType();
		assertNotNull(entityDataType);
		assertEquals(5, entityDataType.getPropertyDefs().size());

		PropertyDef property2 = entityDataType.getPropertyDef("key2");
		assertNotNull(property2);
		assertEquals("Key 2", property2.getLabel());

		PropertyDef property5 = entityDataType.getPropertyDef("key5");
		assertNotNull(property5);
		assertEquals("Key 5", property5.getLabel());
	}
}
