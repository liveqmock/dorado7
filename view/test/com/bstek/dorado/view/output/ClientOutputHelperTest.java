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

package com.bstek.dorado.view.output;

import java.io.OutputStreamWriter;
import java.util.Date;
import java.util.Map;

import com.bstek.dorado.core.Context;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.data.type.manager.DataTypeManager;
import com.bstek.dorado.view.ViewContextTestCase;
import com.bstek.dorado.view.manager.ViewConfig;
import com.bstek.dorado.view.manager.ViewConfigManager;
import com.bstek.dorado.view.widget.Component;
import com.bstek.dorado.view.widget.Container;
import com.bstek.dorado.view.widget.Control;

public class ClientOutputHelperTest extends ViewContextTestCase {

	private ClientOutputHelper getClientOutputHelper()
			throws Exception {
		Context context = Context.getCurrent();
		return (ClientOutputHelper) context
				.getServiceBean("clientOutputHelper");
	}

	private Outputter getObjectOutputterDispatcher() throws Exception {
		Context context = Context.getCurrent();
		return (Outputter) context.getServiceBean("objectOutputterDispatcher");
	}

	private DataTypeManager getDataTypeManager() throws Exception {
		Context context = Context.getCurrent();
		return (DataTypeManager) context.getServiceBean("dataTypeManager");
	}

	private ViewConfigManager getViewConfigManager() throws Exception {
		Context context = Context.getCurrent();
		ViewConfigManager viewConfigManager = (ViewConfigManager) context
				.getServiceBean("viewConfigManager");
		return viewConfigManager;
	}

	public void test1() throws Exception {
		ClientOutputHelper clientOutputHelper = getClientOutputHelper();

		ObjectOutputter dateOutputter = (ObjectOutputter) clientOutputHelper
				.getOutputter(Date.class);
		assertNotNull(dateOutputter);

		Map<String, PropertyConfig> propertieConfigs = dateOutputter
				.getPropertieConfigs();
		assertNotNull(propertieConfigs.get("*"));
	}

	public void test2() throws Exception {
		ClientOutputHelper clientOutputHelper = getClientOutputHelper();

		ObjectOutputter componentOutputter = (ObjectOutputter) clientOutputHelper
				.getOutputter(Component.class);
		assertNotNull(componentOutputter);

		Map<String, PropertyConfig> propertieConfigs = componentOutputter
				.getPropertieConfigs();
		assertNotNull(propertieConfigs.get("ignored"));
	}

	public void test3() throws Exception {
		ClientOutputHelper clientOutputHelper = getClientOutputHelper();

		ObjectOutputter controlOutputter = (ObjectOutputter) clientOutputHelper
				.getOutputter(Control.class);
		assertNotNull(controlOutputter);

		Map<String, PropertyConfig> propertieConfigs = controlOutputter
				.getPropertieConfigs();
		assertNotNull(propertieConfigs.get("layoutConstraint"));
		assertNotNull(propertieConfigs.get("style"));
	}

	public void test4() throws Exception {
		ClientOutputHelper clientOutputHelper = getClientOutputHelper();

		ObjectOutputter containerOutputter = (ObjectOutputter) clientOutputHelper
				.getOutputter(Container.class);
		assertNotNull(containerOutputter);

		Map<String, PropertyConfig> propertieConfigs = containerOutputter
				.getPropertieConfigs();
		assertNotNull(propertieConfigs.get("layout"));
		assertNotNull(propertieConfigs.get("style"));
	}

	public void testOutputDataType() throws Exception {
		DataType dataType = getDataTypeManager().getDataType("test.Master");

		OutputStreamWriter writer = new OutputStreamWriter(System.out);
		try {
			OutputContext context = new OutputContext(writer);
			context.setUsePrettyJson(true);
			getObjectOutputterDispatcher().output(dataType, context);
			writer.flush();
		} finally {
			writer.close();
		}
	}

	public void testOutputView() throws Exception {
		ViewConfig viewConfig = getViewConfigManager().getViewConfig(
				"com/bstek/dorado/view/config/xml/TestView1");

		OutputStreamWriter writer = new OutputStreamWriter(System.out);
		try {
			OutputContext context = new OutputContext(writer);
			context.setUsePrettyJson(true);
			getObjectOutputterDispatcher()
					.output(viewConfig.getView(), context);
			writer.flush();
		} finally {
			writer.close();
		}
	}
}
