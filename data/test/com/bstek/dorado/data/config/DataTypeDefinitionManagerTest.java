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

import java.util.Map;

import com.bstek.dorado.config.definition.Definition;
import com.bstek.dorado.config.definition.DefinitionReference;
import com.bstek.dorado.core.bean.Scope;
import com.bstek.dorado.data.config.definition.DataProviderDefinition;
import com.bstek.dorado.data.config.definition.DataTypeDefinition;
import com.bstek.dorado.data.config.definition.DataTypeDefinitionManager;
import com.bstek.dorado.data.config.xml.DataXmlConstants;

public class DataTypeDefinitionManagerTest extends ConfigManagerTestSupport {

	public void testGetDefinitionByName() throws Exception {
		DataTypeDefinitionManager definitionManager = getDataTypeDefinitionManager();

		final String NAME = "test.User";
		DataTypeDefinition dataType = definitionManager.getDefinition(NAME);
		assertNotNull(dataType);
		assertEquals(NAME, dataType.getName());
		assertEquals(Scope.instant, dataType.getScope());
	}

	public void testGetDefinitionByType() throws Exception {
		DataTypeDefinitionManager definitionManager = getDataTypeDefinitionManager();

		DataTypeDefinition dataType = definitionManager
				.getDefinition(String.class);
		assertNotNull(dataType);
		assertEquals("String", dataType.getName());
		assertNotSame(Scope.singleton, dataType.getScope());
	}

	public void testGetDefinitionByComplexName1() throws Exception {
		DataTypeDefinitionManager definitionManager = getDataTypeDefinitionManager();

		final String NAME = "[test.User]";
		DataTypeDefinition dataType1 = definitionManager.getDefinition(NAME);
		assertNotNull(dataType1);
		assertEquals(NAME, dataType1.getName());
		assertEquals(null, dataType1.getScope());

		DefinitionReference<?> ref = (DefinitionReference<?>) dataType1
				.getProperties().get(
						DataXmlConstants.ATTRIBUTE_ELEMENT_DATA_TYPE);
		assertNotNull(ref);
		assertEquals("test.User",
				((DataTypeDefinition) ref.getDefinition()).getName());

		DataTypeDefinition dataType2 = definitionManager.getDefinition(NAME);
		assertNotNull(dataType2);
		assertSame(dataType1, dataType2);
	}

	public void testGetDefinitionByComplexName2() throws Exception {
		DataTypeDefinitionManager definitionManager = getDataTypeDefinitionManager();

		final String NAME = "Map[String,test.User]";
		DataTypeDefinition dataType1 = definitionManager.getDefinition(NAME);
		assertNotNull(dataType1);
		assertEquals(NAME, dataType1.getName());
		assertEquals(null, dataType1.getScope());

		DefinitionReference<?> ref = (DefinitionReference<?>) dataType1
				.getProperties().get(DataXmlConstants.ATTRIBUTE_KEY_DATA_TYPE);
		assertNotNull(ref);
		assertEquals("String",
				((DataTypeDefinition) ref.getDefinition()).getName());

		ref = (DefinitionReference<?>) dataType1.getProperties().get(
				DataXmlConstants.ATTRIBUTE_VALUE_DATA_TYPE);
		assertNotNull(ref);
		assertEquals("test.User",
				((DataTypeDefinition) ref.getDefinition()).getName());

		DataTypeDefinition dataType2 = definitionManager.getDefinition(NAME);
		assertNotNull(dataType2);
		assertSame(dataType1, dataType2);
	}

	@SuppressWarnings("unchecked")
	public void testDataTypeInPropertyDef() throws Exception {
		DataTypeDefinitionManager definitionManager = getDataTypeDefinitionManager();

		final String NAME = "test.User";
		DataTypeDefinition userDataType = definitionManager.getDefinition(NAME);
		Definition propertyDef = userDataType.getPropertyDef("roles");
		DataTypeDefinition dataType = ((DefinitionReference<DataTypeDefinition>) propertyDef
				.getProperties().get("dataType")).getDefinition();
		assertNotNull(dataType);
	}

	public void testRecursiveDefinition1() throws Exception {
		DataTypeDefinitionManager definitionManager = getDataTypeDefinitionManager();
		DataTypeDefinition productType = definitionManager
				.getDefinition("test.Product");

		Definition typeProperty = productType.getPropertyDef("type");
		assertNotNull(typeProperty);
		DefinitionReference<?> ref = (DefinitionReference<?>) typeProperty
				.getProperties().get("dataType");
		assertNotNull(ref);
		assertSame(productType, ref.getDefinition());
	}

	public void testRecursiveDefinition2() throws Exception {
		DataTypeDefinitionManager definitionManager = getDataTypeDefinitionManager();
		DataTypeDefinition caregoryType = definitionManager
				.getDefinition("test.Category");

		Definition productsProperty = caregoryType.getPropertyDef("products");
		assertNotNull(productsProperty);
		DefinitionReference<?> ref = (DefinitionReference<?>) productsProperty
				.getProperties().get("dataType");
		assertNotNull(ref);
		DataTypeDefinition productsType = (DataTypeDefinition) ref
				.getDefinition();

		ref = (DefinitionReference<?>) productsType.getProperties().get(
				"elementDataType");
		assertNotNull(ref);

		DataTypeDefinition productType = definitionManager
				.getDefinition("test.Product");
		assertSame(productType, ref.getDefinition());
	}

	public void testInheritedAggregationDataType() throws Exception {
		DataTypeDefinitionManager definitionManager = getDataTypeDefinitionManager();

		final String NAME = "test.Managers";
		DataTypeDefinition dataType = definitionManager.getDefinition(NAME);
		assertNotNull(dataType);

		DataTypeDefinition parentDataType = (DataTypeDefinition) dataType
				.getParents()[0];
		assertNotNull(parentDataType);

		DefinitionReference<?> ref = (DefinitionReference<?>) dataType
				.getProperties().get("elementDataType");
		DataTypeDefinition elementDataType = (DataTypeDefinition) ref
				.getDefinition();
		assertNotNull(parentDataType);
		assertEquals("$t:test.Managers#ElementDataType",
				elementDataType.getName());
	}

	public void testReloadConfigs() throws Exception {
		DataTypeDefinitionManager definitionManager = getDataTypeDefinitionManager();

		reloadConfigs();

		DataTypeDefinition dataType1, dataType2;
		DataTypeDefinition parentDataType1, parentDataType2;

		dataType1 = definitionManager.getDefinition("map.Employee");
		parentDataType1 = (DataTypeDefinition) dataType1.getParents()[0];

		reloadConfigs();

		dataType2 = definitionManager.getDefinition("map.Employee");
		parentDataType2 = (DataTypeDefinition) dataType2.getParents()[0];

		assertNotSame(dataType1, dataType2);
		assertNotSame(parentDataType1, parentDataType2);
	}

	public void testReference() throws Exception {
		DataTypeDefinitionManager definitionManager = getDataTypeDefinitionManager();

		DataTypeDefinition masterType = definitionManager
				.getDefinition("test.Master");
		assertEquals(3, masterType.getPropertyDefs().size());

		Definition propertyDef = masterType.getPropertyDef("reference1");
		assertNotNull(propertyDef);

		DefinitionReference<?> providerDefinitionRef = (DefinitionReference<?>) propertyDef
				.getProperties().get("dataProvider");
		assertNotNull(providerDefinitionRef);
		DataProviderDefinition providerDefinition = (DataProviderDefinition) providerDefinitionRef
				.getDefinition();
		assertNotNull(providerDefinition);
		assertEquals("providerReference", providerDefinition.getName());

		propertyDef = masterType.getPropertyDef("reference2");
		assertNotNull(propertyDef);

		providerDefinitionRef = (DefinitionReference<?>) propertyDef
				.getProperties().get("dataProvider");
		assertNotNull(providerDefinitionRef);
		providerDefinition = (DataProviderDefinition) providerDefinitionRef
				.getDefinition();
		assertNotNull(providerDefinition);
		assertFalse("providerReference".equals(providerDefinition.getName()));

		Map<?, ?> parameter = (Map<?, ?>) propertyDef.getProperties().get(
				"parameter");
		assertNotNull(parameter);
	}
}
