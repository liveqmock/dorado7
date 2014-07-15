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

package com.bstek.dorado.data.provider.manager;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Properties;

import org.aopalliance.intercept.MethodInvocation;

import com.bstek.dorado.data.provider.DataProvider;
import com.bstek.dorado.data.provider.Page;

public class TestDataProviderInterceptor {
	public Object returnParameter(Object parameter) {
		return parameter;
	}

	public int method1(int parameter) {
		return parameter * 3;
	}

	public String method2(MethodInvocation methodInvocation, String parameter)
			throws Throwable {
		return parameter + String.valueOf(methodInvocation.proceed());
	}

	public String method3(String parameter, DataProvider dataProvider)
			throws Throwable {
		return parameter + String.valueOf(dataProvider.getName());
	}

	public String method4(DataProvider dataProvider, double p3, int p2,
			boolean p5, String p1) throws Throwable {
		return String.valueOf(dataProvider.getName()) + p1 + p2 + p3 + p5;
	}

	public void getPagingData1(String parameter, Page<Object> page)
			throws Throwable {
		page.getPageNo();
		page.setEntityCount(108);

		Collection<Object> entities = new ArrayList<Object>();
		int start = (page.getPageNo() - 1) * page.getPageSize() + 1;
		int end = start + page.getPageSize() - 1;
		if (end > page.getEntityCount())
			end = page.getEntityCount();

		for (int i = start; i <= end; i++) {
			Properties entity = new Properties();
			entity.put("key", parameter + "-" + i);
			entities.add(entity);
		}
		page.setEntities(entities);
	}
}
