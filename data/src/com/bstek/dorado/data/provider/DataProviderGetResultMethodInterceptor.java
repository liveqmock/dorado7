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

import java.util.Collection;

import org.aopalliance.intercept.MethodInvocation;

import com.bstek.dorado.data.entity.EntityUtils;
import com.bstek.dorado.data.type.DataType;

public final class DataProviderGetResultMethodInterceptor extends
		AbstractDataProviderGetResultMethodInterceptor {

	@Override
	protected Object invokeGetResult(MethodInvocation methodInvocation,
			DataProvider dataProvider, Object parameter, DataType resultDataType)
			throws Throwable, Exception {
		Object result = methodInvocation.proceed();
		if (result != null) {
			result = EntityUtils.toEntity(result, resultDataType);
		}
		return result;
	}

	@Override
	@SuppressWarnings({ "rawtypes", "unchecked" })
	protected Object invokeGetPagingResult(MethodInvocation methodInvocation,
			DataProvider dataProvider, Object parameter, Page page,
			DataType resultDataType) throws Throwable, Exception {
		Object returnValue = methodInvocation.proceed();
		if (page != null) {
			Collection entities = page.getEntities();
			if (entities != null) {
				entities = (Collection) EntityUtils.toEntity(entities,
						resultDataType);
				page.setEntities(entities);
			}
		}
		return returnValue;
	}

}
