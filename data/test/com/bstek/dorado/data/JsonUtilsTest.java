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

package com.bstek.dorado.data;

import java.util.Collection;

import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;

import com.bstek.dorado.core.Context;
import com.bstek.dorado.data.model.Department;
import com.bstek.dorado.data.model.Employee;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.data.type.EntityDataType;
import com.bstek.dorado.data.type.manager.DataTypeManager;

public class JsonUtilsTest extends DataContextTestCase {

	protected DataTypeManager getDataTypeManager() throws Exception {
		Context conetxt = Context.getCurrent();
		DataTypeManager dataTypeManager = (DataTypeManager) conetxt
				.getServiceBean("dataTypeManager");
		return dataTypeManager;
	}

	public void test1() throws Exception {
		DataTypeManager dataTypeManager = getDataTypeManager();
		EntityDataType employeeDataType = (EntityDataType) dataTypeManager
				.getDataType("domain.Employee");

		ObjectMapper objectMapper = JsonUtils.getObjectMapper();
		JsonNode jsonEmployee = objectMapper
				.readTree("{\"id\":\"0001\",\"name\":\"Benny\",\"salary\":88888,\"department\":{\"id\":\"D11\",\"name\":\"PRODUCT\"}}");

		Employee employee = (Employee) JsonUtils.toJavaObject(jsonEmployee,
				employeeDataType);
		assertNotNull(employee);
		assertEquals("0001", employee.getId());
		assertEquals("Benny", employee.getName());
		assertEquals(88888F, employee.getSalary());

		Department department = employee.getDepartment();
		assertNotNull(department);
		assertEquals("D11", department.getId());
		assertEquals("PRODUCT", department.getName());
	}

	@SuppressWarnings("unchecked")
	public void test2() throws Exception {
		DataTypeManager dataTypeManager = getDataTypeManager();
		DataType employeesDataType = dataTypeManager
				.getDataType("[map.Employee]");

		ObjectMapper objectMapper = JsonUtils.getObjectMapper();
		JsonNode jsonArray = objectMapper.readTree("["
				+ "{\"id\":\"0001\",\"name\":\"Tom\"},"
				+ "{\"id\":\"0002\",\"name\":\"John\"},"
				+ "{\"id\":\"0003\",\"name\":\"Mike\"}" + "]");

		Collection<Employee> employees = (Collection<Employee>) JsonUtils
				.toJavaObject(jsonArray, employeesDataType);
		assertNotNull(employees);
		assertEquals(3, employees.size());
	}
}
