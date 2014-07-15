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

import java.io.StringWriter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.bstek.dorado.data.config.ConfigManagerTestSupport;
import com.bstek.dorado.data.provider.DataProvider;
import com.bstek.dorado.data.provider.DirectDataProvider;
import com.bstek.dorado.data.provider.PagingList;

public class DataOutputterTest extends ConfigManagerTestSupport {

	private static DataOutputter dataOutputter = new DataOutputter();

	private String getOutput(Object object) throws Exception {
		StringWriter writer = new StringWriter();
		dataOutputter.output(object, new OutputContext(writer));
		return writer.toString();
	}

	public void testNull() throws Exception {
		String output = getOutput(null);
		assertEquals("null", output);
	}

	public void testMap() throws Exception {
		Map<String, Object> map = new LinkedHashMap<String, Object>();
		map.put("key1", "value1");
		map.put("key2", Integer.valueOf(88));
		map.put("key3", Boolean.FALSE);
		map.put("key4", null);

		String output = getOutput(map);
		assertEquals(
				"{\"key1\":\"value1\",\"key2\":88,\"key3\":false,\"key4\":null}",
				output);
	}

	public void testList() throws Exception {
		List<Object> list = new ArrayList<Object>();
		list.add("value1");
		list.add(Integer.valueOf(88));
		list.add(Boolean.FALSE);
		list.add(null);

		String output = getOutput(list);
		assertEquals("[\"value1\",88,false,null]", output);
	}

	@SuppressWarnings("rawtypes")
	public void testEntity() throws Exception {
		DataProvider dataProvider = getDataProviderManager().getDataProvider(
				"providerMaster");
		List data = (List) dataProvider.getResult();
		Map master = (Map) data.get(0);

		String output = getOutput(master);
		assertEquals("{\"referenceKey\":\"key1\"}", output);
	}

	@SuppressWarnings("rawtypes")
	public void testPagingList() throws Exception {
		List<Integer> list = new ArrayList<Integer>();
		for (int i = 0; i < 1000; i++) {
			list.add(Integer.valueOf(i));
		}

		DirectDataProvider directDataProvider = new DirectDataProvider();
		directDataProvider.setResult(list);

		PagingList pagingList = new PagingList(directDataProvider, null, null,
				5);
		String output = getOutput(pagingList);
		assertEquals("(function(){\n" + "var a=[0,1,2,3,4];\n"
				+ "a.pageSize=5;\n" + "a.pageNo=1;\n" + "a.pageCount=200;\n"
				+ "a.entityCount=1000;\n" + "return a;\n" + "})()", output);
	}
}
