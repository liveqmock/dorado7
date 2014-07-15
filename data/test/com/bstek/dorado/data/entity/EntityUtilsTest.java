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

package com.bstek.dorado.data.entity;

import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.bstek.dorado.data.config.ConfigManagerTestSupport;
import com.bstek.dorado.data.entity.EntityState;
import com.bstek.dorado.data.entity.EntityUtils;
import com.bstek.dorado.data.entity.FilterType;
import com.bstek.dorado.data.provider.DataProvider;
import com.bstek.dorado.data.type.DataType;

@SuppressWarnings({ "unchecked", "rawtypes" })
public class EntityUtilsTest extends ConfigManagerTestSupport {

	public void testDataType() throws Exception {
		DataProvider dataProvider = getDataProviderManager().getDataProvider(
				"testProvider1");
		List list = (List) dataProvider.getResult();
		Map map1 = (Map) list.get(0);
		DataType dataType;

		dataType = EntityUtils.getDataType(list);
		assertNotNull(dataType);

		dataType = EntityUtils.getDataType(map1);
		assertNotNull(dataType);
	}

	public void testState() throws Exception {
		DataProvider dataProvider = getDataProviderManager().getDataProvider(
				"testProvider1");
		List list = (List) dataProvider.getResult();
		Map map1 = (Map) list.get(0);
		Map map2 = (Map) list.get(1);

		assertEquals(EntityState.NONE, EntityUtils.getState(map1));

		map1.put("key1", "modified");
		assertEquals(EntityState.MODIFIED, EntityUtils.getState(map1));

		EntityUtils.setState(map1, EntityState.DELETED);
		assertEquals(EntityState.DELETED, EntityUtils.getState(map1));

		EntityUtils.setState(map2, EntityState.NEW);
		map2.put("key2", "modified");
		assertEquals(EntityState.NEW, EntityUtils.getState(map2));

		EntityUtils.resetEntity(map1);
		// DELETED状态的Entity，状态不需要也不可以重置。
		assertEquals(EntityState.DELETED, EntityUtils.getState(map1));

		EntityUtils.resetEntity(map2);
		assertEquals(EntityState.NONE, EntityUtils.getState(map2));
	}

	public void testEntityIterator1() throws Exception {
		DataProvider dataProvider = getDataProviderManager().getDataProvider(
				"testProvider1");
		List list = (List) dataProvider.getResult();
		Map map1 = (Map) list.get(0);
		Map map2 = (Map) list.get(1);
		Map map3 = (Map) list.get(2);
		Iterator iterator;
		int counter;

		counter = 0;
		iterator = EntityUtils.getIterator(list, FilterType.NONE);
		while (iterator.hasNext()) {
			assertEquals(EntityState.NONE,
					EntityUtils.getState(iterator.next()));
			counter++;
		}
		assertEquals(3, counter);

		counter = 0;
		iterator = EntityUtils.getIterator(list, FilterType.DIRTY);
		while (iterator.hasNext()) {
			assertFalse((EntityState.NONE == EntityUtils.getState(iterator
					.next())));
			counter++;
		}
		assertEquals(0, counter);

		map2.put("key1", "haha");
		EntityUtils.getState(map2);

		counter = 0;
		iterator = EntityUtils.getIterator(list, FilterType.DIRTY);
		while (iterator.hasNext()) {
			assertFalse((EntityState.NONE == EntityUtils.getState(iterator
					.next())));
			counter++;
		}
		assertEquals(1, counter);

		counter = 0;
		iterator = EntityUtils.getIterator(list, FilterType.MODIFIED);
		while (iterator.hasNext()) {
			assertEquals(EntityState.MODIFIED,
					EntityUtils.getState(iterator.next()));
			counter++;
		}
		assertEquals(1, counter);

		EntityUtils.markDeleted(map3);
		EntityUtils.setState(map1, EntityState.NEW);

		counter = 0;
		iterator = EntityUtils.getIterator(list, FilterType.DIRTY);
		while (iterator.hasNext()) {
			assertFalse((EntityState.NONE == EntityUtils.getState(iterator
					.next())));
			counter++;
		}
		assertEquals(3, counter);

		counter = 0;
		iterator = EntityUtils.getIterator(list, FilterType.NONE);
		while (iterator.hasNext()) {
			assertEquals(EntityState.NONE,
					EntityUtils.getState(iterator.next()));
			counter++;
		}
		assertEquals(0, counter);
	}

	public void testEntityIterator2() throws Exception {
		DataProvider dataProvider = getDataProviderManager().getDataProvider(
				"testProvider1");
		List list = (List) dataProvider.getResult();
		Iterator iterator;

		int i = 0;
		iterator = EntityUtils.getIterator(list, FilterType.NONE);
		while (iterator.hasNext()) {
			Object entity = iterator.next();
			assertSame(list.get(i++), entity);
		}

		iterator = EntityUtils.getIterator(list, FilterType.NONE);
		while (iterator.hasNext()) {
			Object entity = iterator.next();
			iterator.remove();
			assertEquals(EntityState.DELETED, EntityUtils.getState(entity));
		}

		int counter = 0;
		iterator = EntityUtils.getIterator(list, FilterType.DELETED);
		while (iterator.hasNext()) {
			assertEquals(EntityState.DELETED,
					EntityUtils.getState(iterator.next()));
			counter++;
		}
		assertEquals(3, counter);
	}

}
