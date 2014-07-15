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

package com.bstek.dorado.data.config;

import java.util.List;
import java.util.Map;

import com.bstek.dorado.config.definition.DefinitionReference;
import com.bstek.dorado.core.bean.Scope;
import com.bstek.dorado.data.config.definition.DataProviderDefinition;
import com.bstek.dorado.data.config.definition.DataProviderDefinitionManager;
import com.bstek.dorado.data.config.definition.DataTypeDefinition;
import com.bstek.dorado.data.provider.DirectDataProvider;

public class DataProviderDefinitionManagerTest extends ConfigManagerTestSupport {

	@SuppressWarnings("unchecked")
	public void testGetDefinitionByName() throws Exception {
		DataProviderDefinitionManager definitionManager = getDataProviderDefinitionManager();

		final String NAME = "testProvider1";
		DataProviderDefinition dataProvider = definitionManager
				.getDefinition(NAME);
		assertNotNull(dataProvider);
		assertEquals(NAME, dataProvider.getName());
		assertEquals(Scope.instant, dataProvider.getScope());
		assertEquals(DirectDataProvider.class.getName(), dataProvider.getImpl());

		Map<String, Object> properties = dataProvider.getProperties();
		DefinitionReference<DataTypeDefinition> ref = (DefinitionReference<DataTypeDefinition>) properties
				.get("resultDataType");
		assertNotNull(ref);
		DataTypeDefinition dataType = ref.getDefinition();
		assertNotNull(dataType);

		ref = (DefinitionReference<DataTypeDefinition>) dataType
				.getProperties().get("elementDataType");
		assertNotNull(ref);
		assertEquals(3, ref.getDefinition().getPropertyDefs().size());

		List<?> result = (List<?>) properties.get("result");
		assertNotNull(result);
	}
}
