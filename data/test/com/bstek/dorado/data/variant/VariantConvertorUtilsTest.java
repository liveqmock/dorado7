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

package com.bstek.dorado.data.variant;

import com.bstek.dorado.data.config.ConfigManagerTestSupport;
import com.bstek.dorado.data.config.definition.DataTypeDefinition;
import com.bstek.dorado.data.config.definition.DataTypeDefinitionManager;
import com.bstek.dorado.data.variant.VariantConvertor;
import com.bstek.dorado.data.variant.VariantUtils;

public class VariantConvertorUtilsTest extends ConfigManagerTestSupport {
	public void testConfigureReload() throws Exception {
		DataTypeDefinitionManager definitionManager = getDataTypeDefinitionManager();

		VariantConvertor variantConvertor = VariantUtils.getVariantConvertor();
		assertTrue(variantConvertor.toBoolean("on"));

		reloadConfigs();
		DataTypeDefinition dataTypeDefinition = definitionManager
				.getDefinition(boolean.class);
		dataTypeDefinition.setImpl(ReversePrimitiveBooleanDataType.class
				.getName());
		dataTypeDefinition.setBeanId("DataType:reverseBoolean");

		assertFalse(variantConvertor.toBoolean("on"));

		reloadConfigs();
		assertTrue(variantConvertor.toBoolean("on"));
	}
}
