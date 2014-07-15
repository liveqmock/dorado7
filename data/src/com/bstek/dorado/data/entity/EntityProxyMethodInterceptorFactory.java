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

import org.aopalliance.intercept.MethodInterceptor;

import com.bstek.dorado.data.type.EntityDataType;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-12-20
 */
public interface EntityProxyMethodInterceptorFactory {
	/**
	 * 根据传入的数据类型和相应的Class类型，创建并返回一组方法拦截器。
	 * 
	 * @throws Exception
	 */
	MethodInterceptor[] createInterceptors(EntityDataType dataType,
			Class<?> classType, Object entity) throws Exception;
}
