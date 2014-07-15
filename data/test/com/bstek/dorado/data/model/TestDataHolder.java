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

package com.bstek.dorado.data.model;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.beanutils.PropertyUtils;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.node.ArrayNode;
import org.codehaus.jackson.type.TypeReference;

import com.bstek.dorado.core.Constants;
import com.bstek.dorado.data.JsonUtils;
import com.bstek.dorado.data.entity.EntityState;
import com.bstek.dorado.data.entity.EntityUtils;
import com.bstek.dorado.data.provider.Page;

@SuppressWarnings({ "unchecked", "rawtypes" })
public abstract class TestDataHolder {

	private static List<Department> demainTestData1;
	private static List mapTestData1;
	private static Map<String, Employee> demainTestData2;
	private static Map<String, Employee> demainTestData3;

	private static ArrayNode getTestData1() throws IOException {
		InputStreamReader isr = new InputStreamReader(
				TestDataHolder.class
						.getResourceAsStream("/com/bstek/dorado/data/model/test-data1.js"),
				Constants.DEFAULT_CHARSET);
		try {
			BufferedReader reader = new BufferedReader(isr);
			String l;
			StringBuffer sb = new StringBuffer();
			while ((l = reader.readLine()) != null) {
				sb.append(l).append('\n');
			}
			ArrayNode json = (ArrayNode) JsonUtils.getObjectMapper().readTree(
					sb.toString());
			return json;
		} finally {
			isr.close();
		}
	}

	private static ArrayNode getTestData2() throws IOException {
		InputStreamReader isr = new InputStreamReader(
				TestDataHolder.class
						.getResourceAsStream("/com/bstek/dorado/data/model/test-data2.js"),
				Constants.DEFAULT_CHARSET);
		try {
			BufferedReader reader = new BufferedReader(isr);
			String l;
			StringBuffer sb = new StringBuffer();
			while ((l = reader.readLine()) != null) {
				sb.append(l).append('\n');
			}
			ArrayNode json = (ArrayNode) JsonUtils.getObjectMapper().readTree(
					sb.toString());
			return json;
		} finally {
			isr.close();
		}
	}

	public static List<Department> getDomainTestData1() throws IOException {
		if (demainTestData1 == null) {
			ArrayNode jsonArray = getTestData1();
			ObjectMapper objectMapper = JsonUtils.getObjectMapper();
			demainTestData1 = objectMapper.readValue(jsonArray,
					new TypeReference<List<Department>>() {
					});
		}
		return demainTestData1;
	}

	public static List getMapTestData1() throws IOException {
		if (mapTestData1 == null) {
			ArrayNode jsonArray = getTestData1();
			ObjectMapper objectMapper = JsonUtils.getObjectMapper();
			mapTestData1 = objectMapper.readValue(jsonArray,
					new TypeReference<List<HashMap>>() {
					});
			mapTestData1 = new ArrayList();
			for (JsonNode node : jsonArray) {
				mapTestData1.add(objectMapper.treeToValue(node, HashMap.class));
			}
		}
		return mapTestData1;
	}

	private static int index = 0;

	public static void updateDomainTestData1(List<Department> departments) {
		Department department = departments.get(0);
		department = department.getDepartments().get(1);
		department = department.getDepartments().get(1);

		List<Employee> employees = department.getEmployees();
		Employee employee = employees.get(1);
		employee.setSalary(employee.getSalary() + 1);

		index++;
		employee = new Employee();
		employee.setId("NEW_E" + index);
		employee.setName("Name" + index);
		employees.add(employee);

		demainTestData1 = departments;
	}

	public static Collection<Employee> getDomainTestData2() throws IOException {
		if (demainTestData2 == null) {
			ArrayNode jsonArray = getTestData2();
			ObjectMapper objectMapper = JsonUtils.getObjectMapper();
			demainTestData2 = objectMapper.readValue(jsonArray,
					new TypeReference<LinkedHashMap<String, Employee>>() {
					});
		}
		return new ArrayList<Employee>(demainTestData2.values());
	}

	public static void updateDomainTestData2(List<Employee> employees)
			throws IllegalAccessException, InvocationTargetException,
			NoSuchMethodException {
		for (Iterator<Employee> it = employees.iterator(); it.hasNext();) {
			Employee employee = it.next();
			EntityState state = EntityUtils.getState(employee);
			if (state == EntityState.DELETED) {
				demainTestData2.remove(employee.getId());
				it.remove();
			} else if (state == EntityState.MODIFIED) {
				Employee e = demainTestData2.get(employee.getId());
				employee.setSalary(employee.getSalary() + 1);
				if (e != null) {
					PropertyUtils.copyProperties(e, employee);
				}
				EntityUtils.setState(employee, EntityState.NONE);
			} else if (state == EntityState.NEW) {
				Employee e = new Employee();
				PropertyUtils.copyProperties(e, employee);
				demainTestData2.put(e.getId(), e);
				EntityUtils.setState(employee, EntityState.NONE);
			}
		}
	}

	public static Collection<Employee> getDomainTestData3() throws IOException {
		if (demainTestData3 == null) {
			demainTestData3 = new LinkedHashMap<String, Employee>();
			for (int i = 0; i < 100; i++) {
				Employee employee = new Employee();
				employee.setId("E" + i);
				employee.setName("NAME_" + i);
				employee.setSalary((float) Math.random() * 10000);
				employee.setSex(Math.random() > 0.5);
				demainTestData3.put(employee.getId(), employee);
			}
		}
		return new ArrayList<Employee>(demainTestData3.values());
	}

	public static void getDomainTestData3(Page page) throws IOException {
		List<Employee> employees = (List<Employee>) getDomainTestData3();
		page.setEntities(employees.subList(page.getFirstEntityIndex(),
				page.getLastEntityIndex()));
		page.setEntityCount(employees.size());
	}

}
