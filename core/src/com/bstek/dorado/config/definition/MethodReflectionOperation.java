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

package com.bstek.dorado.config.definition;

import java.lang.reflect.Method;

/**
 * 用于执行方法反射调用的初始化方法。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 8, 2008
 */
public class MethodReflectionOperation implements Operation {
	private String methodName;
	private Class<?>[] parameterTypes;
	private Object[] parameters;
	private Method method;

	/**
	 * @param methodName
	 *            要反射调用的方法名
	 * @param parameterType
	 *            方法调用参数的类型，仅使用于只有一个调用参数的方法。
	 * @param parameter
	 *            方法的调用参数
	 */
	public MethodReflectionOperation(String methodName, Class<?> parameterType,
			Object parameter) {
		this(methodName, new Class<?>[] { parameterType },
				new Object[] { parameter });
	}

	/**
	 * @param methodName
	 *            要反射调用的方法名
	 * @param parameterTypes
	 *            方法调用参数的类型
	 * @param parameters
	 *            方法的调用参数
	 */
	public MethodReflectionOperation(String methodName,
			Class<?>[] parameterTypes, Object[] parameters) {
		this.methodName = methodName;
		this.parameterTypes = parameterTypes;
		this.parameters = parameters;
	}

	public void execute(Object object, CreationContext definitionContext)
			throws Exception {
		if (method == null) {
			method = object.getClass().getMethod(methodName, parameterTypes);
		}
		Object[] realParameters = new Object[parameters.length];
		for (int i = 0; i < parameters.length; i++) {
			realParameters[i] = DefinitionUtils.getRealValue(parameters[i],
					definitionContext);
		}
		method.invoke(object, realParameters);
	}

}
