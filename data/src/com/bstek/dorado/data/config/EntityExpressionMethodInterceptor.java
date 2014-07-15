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

package com.bstek.dorado.data.config;

import java.beans.BeanInfo;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

import com.bstek.dorado.config.ExpressionMethodInterceptor;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.el.Expression;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.data.type.manager.DataTypeManager;

/**
 * 用于实现对Bean属性中EL表达式实时求值功能的方法拦截器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apirl, 2 2007
 */
public class EntityExpressionMethodInterceptor extends
		ExpressionMethodInterceptor {
	private static DataTypeManager dataTypeManager;

	/**
	 * @param expressionProperties
	 *            EL表达式的集合。其中Map的键值为相应的对象属性名，值为EL表达式。
	 */
	public EntityExpressionMethodInterceptor(
			Map<String, Expression> expressionProperties) {
		super(expressionProperties);
	}

	@Override
	protected void discoverInterceptingMethods(Class<?> clazz) throws Exception {
		if (dataTypeManager == null) {
			Context context = Context.getCurrent();
			dataTypeManager = (DataTypeManager) context
					.getServiceBean("dataTypeManager");
		}

		interceptingReadMethods = new HashMap<Method, ReadMethodDescriptor>();
		interceptingWriteMethods = new HashMap<Method, Method>();
		Map<Method, ReadMethodDescriptor> getterMethods = interceptingReadMethods;
		Map<Method, Method> setterMethods = interceptingWriteMethods;
		Map<String, Expression> expressionProperties = getExpressionProperties();

		BeanInfo beanInfo = Introspector.getBeanInfo(clazz);
		PropertyDescriptor[] propertyDescriptors = beanInfo
				.getPropertyDescriptors();
		for (PropertyDescriptor propertyDescriptor : propertyDescriptors) {
			String property = propertyDescriptor.getName();
			if (expressionProperties.containsKey(property)) {
				DataType dataType = dataTypeManager
						.getDataType(propertyDescriptor.getPropertyType());
				Method readMethod = propertyDescriptor.getReadMethod();
				Method writeMethod = propertyDescriptor.getWriteMethod();
				if (readMethod != null) {
					if (readMethod.getDeclaringClass() != clazz) {
						readMethod = clazz.getMethod(readMethod.getName(),
								readMethod.getParameterTypes());
					}
					getterMethods.put(readMethod, new ReadMethodDescriptor(
							property, dataType));
				}
				if (writeMethod != null) {
					if (writeMethod.getDeclaringClass() != clazz) {
						writeMethod = clazz.getMethod(writeMethod.getName(),
								writeMethod.getParameterTypes());
					}
					setterMethods.put(writeMethod, readMethod);
				}
			}
		}
	}

	@Override
	protected Object evaluateExpression(ReadMethodDescriptor methodDescriptor) {
		String property = methodDescriptor.getProperty();
		DataType dataType = (DataType) methodDescriptor.getReserve();

		Expression expression = getExpressionProperties().get(property);
		Object result = expression.evaluate();
		if (dataType != null) {
			result = dataType.fromObject(result);
		}
		return result;
	}
}
