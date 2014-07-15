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

package com.bstek.dorado.data.type.manager;

import com.bstek.dorado.data.config.ConfigManagerTestSupport;
import com.bstek.dorado.data.model.Department;
import com.bstek.dorado.data.type.AggregationDataType;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.data.type.EntityDataType;
import com.bstek.dorado.data.type.property.PropertyDef;

public class DataTypeManagerTest extends ConfigManagerTestSupport {

	public void testGetDataTypeByName() throws Exception {
		DataTypeManager dataTypeManager = getDataTypeManager();

		String name = "Array";
		DataType dataType = dataTypeManager.getDataType(name);
		assertEquals(name, dataType.getName());

		name = "Float";
		dataType = dataTypeManager.getDataType(name);
		assertEquals(name, dataType.getName());

		name = "Bean";
		dataType = dataTypeManager.getDataType(name);
		assertEquals(name, dataType.getName());
	}

	public void testGetDataTypeByClass() throws Exception {
		DataTypeManager dataTypeManager = getDataTypeManager();

		Class<?> type = Double.class;
		DataType dataType = dataTypeManager.getDataType(type);
		assertEquals("Double", dataType.getName());

		type = java.util.HashMap.class;
		dataType = dataTypeManager.getDataType(type);
		assertEquals("Map", dataType.getName());

		type = String[].class;
		dataType = dataTypeManager.getDataType(type);
		assertEquals("Array[String]", dataType.getName());

		type = MockClass1.class;
		dataType = dataTypeManager.getDataType(type);
		assertEquals("Entity", dataType.getName());
	}

	public void testBaseTypes() throws Exception {
		DataTypeManager dataTypeManager = getDataTypeManager();

		String NAME = "String";
		DataType dataType1 = dataTypeManager.getDataType(NAME);
		assertNotNull(dataType1);
		assertEquals(NAME, dataType1.getName());
		assertEquals(String.class, dataType1.getMatchType());

		DataType dataType2 = dataTypeManager.getDataType(NAME);
		assertSame(dataType1, dataType2);
	}

	public void testMutableDataTypes() throws Exception {
		DataTypeManager dataTypeManager = getDataTypeManager();

		String NAME = "map.Branch";
		DataType dataType1 = dataTypeManager.getDataType(NAME);
		assertNotNull(dataType1);
		assertEquals(NAME, dataType1.getName());

		DataType dataType2 = dataTypeManager.getDataType(NAME);
		assertSame(dataType1, dataType2);
	}

	public void testScope() throws Exception {
		DataTypeManager dataTypeManager = getDataTypeManager();

		String NAME = "test.User";
		DataType dataType1 = dataTypeManager.getDataType(NAME);
		assertNotNull(dataType1);

		DataType dataType2 = dataTypeManager.getDataType(NAME);
		assertNotSame(dataType1, dataType2);
	}

	public void testPropertyDefs() throws Exception {
		DataTypeManager dataTypeManager = getDataTypeManager();

		String NAME = "map.Employee";
		EntityDataType employeeDataType = (EntityDataType) dataTypeManager
				.getDataType(NAME);
		assertNotNull(employeeDataType);

		assertEquals(6, employeeDataType.getPropertyDefs().size());
		PropertyDef property = employeeDataType.getPropertyDef("birthday");
		assertNotNull(property);
		assertEquals("Date", property.getDataType().getName());
	}

	public void testCirculativeReference1() throws Exception {
		DataTypeManager dataTypeManager = getDataTypeManager();

		String NAME = "test.Product";
		DataType dataType = dataTypeManager.getDataType(NAME);
		assertNotNull(dataType);
	}

	public void testCirculativeReference2() throws Exception {
		DataTypeManager dataTypeManager = getDataTypeManager();

		String NAME = "test.Category";
		DataType dataType = dataTypeManager.getDataType(NAME);
		assertNotNull(dataType);
	}

	public void testInheritedPropertyDefs() throws Exception {
		DataTypeManager dataTypeManager = getDataTypeManager();

		String NAME = "test.Manager";
		EntityDataType managerDataType = (EntityDataType) dataTypeManager
				.getDataType(NAME);
		assertNotNull(managerDataType);

		assertEquals(7, managerDataType.getPropertyDefs().size());
		PropertyDef property = managerDataType.getPropertyDef("birthday");
		assertNotNull(property);
		assertEquals("Date", property.getDataType().getName());

		property = managerDataType.getPropertyDef("propertyOfManager");
		assertNotNull(property);
	}

	public void testMultiParentsInheritedPropertyDefs() throws Exception {
		DataTypeManager dataTypeManager = getDataTypeManager();

		String NAME = "test.CategoryAndProduct";

		EntityDataType childDataType = (EntityDataType) dataTypeManager
				.getDataType(NAME);
		assertNotNull(childDataType);

		assertEquals(5, childDataType.getPropertyDefs().size());
		assertNotNull(childDataType.getPropertyDef("categories"));
		assertNotNull(childDataType.getPropertyDef("type"));
	}

	public void testInheritedAggregationDataType() throws Exception {
		DataTypeManager dataTypeManager = getDataTypeManager();

		String NAME = "test.Managers";
		AggregationDataType dataType = (AggregationDataType) dataTypeManager
				.getDataType(NAME);
		assertNotNull(dataType);

		EntityDataType elementDataType = (EntityDataType) dataType
				.getElementDataType();
		assertNotNull(elementDataType);

		PropertyDef property = elementDataType.getPropertyDef("name");
		assertNotNull(property);

		property = elementDataType.getPropertyDef("propertyOfManager");
		assertNotNull(property);

		property = elementDataType.getPropertyDef("propertyOfManagers");
		assertNotNull(property);

		assertEquals(8, elementDataType.getPropertyDefs().size());
	}

	public void testAutoCreatePropertyDefs() throws Exception {
		DataTypeManager dataTypeManager = getDataTypeManager();
		EntityDataType dataType = (EntityDataType) dataTypeManager
				.getDataType("domain.AutoEmployee");
		PropertyDef property;

		property = dataType.getPropertyDef("name");
		assertNotNull(property);
		assertEquals("姓名", property.getLabel());

		property = dataType.getPropertyDef("id");
		assertNotNull(property);
		assertSame(dataTypeManager.getDataType(String.class),
				property.getDataType());

		property = dataType.getPropertyDef("department");
		assertNotNull(property);
		assertSame(dataTypeManager.getDataType(Department.class),
				property.getDataType());
	}
}

class MockClass1 {
};

class MockClass2 implements java.util.Iterator<Object> {
	public boolean hasNext() {
		return false;
	}

	public Object next() {
		return null;
	}

	public void remove() {
	}
};

class MockClass3 extends MockClass2 implements java.util.Enumeration<Object> {
	public boolean hasMoreElements() {
		return false;
	}

	public Object nextElement() {
		return null;
	}
};
