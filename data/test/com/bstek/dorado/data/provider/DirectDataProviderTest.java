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

package com.bstek.dorado.data.provider;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;

import org.apache.commons.lang.RandomStringUtils;

import com.bstek.dorado.data.config.ConfigManagerTestSupport;
import com.bstek.dorado.data.entity.EntityCollection;
import com.bstek.dorado.data.provider.DirectDataProvider;
import com.bstek.dorado.data.provider.Page;

public class DirectDataProviderTest extends ConfigManagerTestSupport {

	public void testGetBeanResult() throws Exception {
		TestMockBean bean = new TestMockBean();
		bean.setText(RandomStringUtils.random(10));

		DirectDataProvider directDataProvider = new DirectDataProvider();
		directDataProvider.setResult(bean);
		TestMockBean result = (TestMockBean) directDataProvider.getResult();
		assertSame(bean, result);
		assertEquals(bean.getText(), result.getText());
	}

	@SuppressWarnings("unchecked")
	public void testGetListResult() throws Exception {
		List<TestMockBean> list = new ArrayList<TestMockBean>();
		TestMockBean bean;

		bean = new TestMockBean();
		bean.setText(RandomStringUtils.random(10));
		list.add(bean);

		bean = new TestMockBean();
		bean.setText(RandomStringUtils.random(10));
		list.add(bean);

		bean = new TestMockBean();
		bean.setText(RandomStringUtils.random(10));
		list.add(bean);

		DirectDataProvider directDataProvider = new DirectDataProvider();
		directDataProvider.setResult(list);

		List<TestMockBean> result = (List<TestMockBean>) directDataProvider
				.getResult();
		assertSame(list, result);
		assertFalse(result instanceof EntityCollection);
		assertEquals(result.size(), list.size());

		for (int i = 0; i < list.size(); i++) {
			TestMockBean resultBean = result.get(i);
			TestMockBean originBean = list.get(i);
			assertSame(resultBean, originBean);
			assertEquals(resultBean.getText(), originBean.getText());
		}

		int index = 0;
		for (Iterator<TestMockBean> iter = result.iterator(); iter.hasNext();) {
			TestMockBean resultBean = iter.next();
			TestMockBean originBean = list.get(index);
			assertSame(resultBean, originBean);
			assertEquals(resultBean.getText(), originBean.getText());
			index++;
		}
	}

	@SuppressWarnings("rawtypes")
	public void testGetPagingResult() throws Exception {
		List<Integer> list = new ArrayList<Integer>();
		for (int i = 0; i < 1000; i++) {
			list.add(Integer.valueOf(i));
		}

		DirectDataProvider directDataProvider = new DirectDataProvider();
		directDataProvider.setResult(list);

		int pageSize = 10, pageNo = 5;
		Page page = new Page(pageSize, pageNo);
		directDataProvider.getPagingResult(page);

		assertEquals(pageSize, page.getPageSize());
		assertEquals(100, page.getPageCount());
		assertEquals(1000, page.getEntityCount());

		Collection<?> entities = page.getEntities();
		assertEquals(pageSize, entities.size());
		assertEquals(Integer.valueOf(40), entities.iterator().next());
	}

}
