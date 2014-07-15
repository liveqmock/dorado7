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

package com.bstek.dorado.config;

import java.beans.BeanInfo;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;
import org.apache.commons.beanutils.PropertyUtils;

import com.bstek.dorado.core.el.EvaluateMode;
import com.bstek.dorado.core.el.Expression;
import com.bstek.dorado.util.Assert;

/**
 * 用于实现对对象属性中EL表达式实时求值功能的方法拦截器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jan 14, 2008
 */
public class ExpressionMethodInterceptor implements MethodInterceptor {
	protected static final String GET = "get";
	protected static final String PUT = "put";
	protected static final String ENTRY_SET = "entrySet";

	protected static class ReadMethodDescriptor {
		private String property;
		private Object reserve;

		public ReadMethodDescriptor(String property, Object reserve) {
			this.property = property;
			this.reserve = reserve;
		}

		public String getProperty() {
			return property;
		}

		public Object getReserve() {
			return reserve;
		}
	};

	boolean disabled;
	private Map<String, Expression> expressionProperties;

	protected Map<Method, ReadMethodDescriptor> interceptingReadMethods;
	protected Map<Method, Method> interceptingWriteMethods;

	/**
	 * 返回该方法拦截器当前是否已被禁用。
	 */
	public boolean isDisabled() {
		return disabled;
	}

	/**
	 * 设置该方法拦截器当前是否被禁用。
	 */
	public void setDisabled(boolean disabled) {
		this.disabled = disabled;
	}

	/**
	 * 返回一个包含EL表达式信息的Map。该Map的键值为属性名，值为具体的EL表达式。
	 */
	public Map<String, Expression> getExpressionProperties() {
		return expressionProperties;
	}

	/**
	 * @param expressionProperties
	 *            包含EL表达式信息的Map。其中Map的键值为相应的对象属性名，值为EL表达式。
	 */
	public ExpressionMethodInterceptor(
			Map<String, Expression> expressionProperties) {
		Assert.notNull(expressionProperties);
		this.expressionProperties = expressionProperties;
	}

	protected void discoverInterceptingMethods(Class<?> clazz) throws Exception {
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
				Method readMethod = propertyDescriptor.getReadMethod();
				Method writeMethod = propertyDescriptor.getWriteMethod();

				if (readMethod != null) {
					if (readMethod.getDeclaringClass() != clazz) {
						readMethod = clazz.getMethod(readMethod.getName(),
								readMethod.getParameterTypes());
					}
					getterMethods.put(readMethod, new ReadMethodDescriptor(
							property, null));
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

	/**
	 * 根据被拦截到的方法评估(evaluate)相应的EL表达式，并返回其结果。
	 * 
	 * @param methodDescriptor
	 *            被拦截到的方法。
	 * @return EL表达式的评估结果。
	 */
	protected Object evaluateExpression(ReadMethodDescriptor methodDescriptor) {
		String property = methodDescriptor.getProperty();
		Expression expression = getExpressionProperties().get(property);
		return expression.evaluate();
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public Object invoke(MethodInvocation methodInvocation) throws Throwable {
		if (!disabled) {
			Object object = methodInvocation.getThis();
			if (object instanceof Map<?, ?>) {
				final String methodName = methodInvocation.getMethod()
						.getName();
				if (GET.equals(methodName)) {
					String property = (String) methodInvocation.getArguments()[0];
					Expression expression = getExpressionProperties().get(
							property);
					if (expression != null) {
						Object value = expression.evaluate();
						if (expression.getEvaluateMode() == EvaluateMode.onInstantiate) {
							Map map = (Map) object;
							map.put(property, value);
						}
						return value;
					}
				} else if (PUT.equals(methodName)) {
					String property = (String) methodInvocation.getArguments()[0];
					getExpressionProperties().remove(property);
				} else if (ENTRY_SET.equals(methodName)) {
					Map map = (Map) object;
					Set<Map.Entry> entrySet = (Set<Map.Entry>) methodInvocation
							.proceed();
					Set newEntrySet = new HashSet();
					for (Map.Entry entry : entrySet) {
						newEntrySet.add(new MapEntry(map, entry.getKey()));
					}
					return newEntrySet;
				}
			} else {
				if (interceptingReadMethods == null) {
					discoverInterceptingMethods(object.getClass()
							.getSuperclass());
				}

				Method method = methodInvocation.getMethod();
				if (methodInvocation.getArguments().length == 0) {
					ReadMethodDescriptor methodDescriptor = interceptingReadMethods
							.get(method);
					if (methodDescriptor != null) {
						Expression expression = getExpressionProperties().get(
								methodDescriptor.getProperty());
						Object value = evaluateExpression(methodDescriptor);
						if (expression.getEvaluateMode() != EvaluateMode.onRead) {
							PropertyUtils.setSimpleProperty(object,
									methodDescriptor.getProperty(), value);
						}
						return value;
					}
				} else {
					Method readMethod = interceptingWriteMethods.get(method);
					if (readMethod != null) {
						interceptingReadMethods.remove(readMethod);
						interceptingWriteMethods.remove(method);
					}
				}
			}
		}
		return methodInvocation.proceed();
	}
}

@SuppressWarnings({ "unchecked", "rawtypes" })
class MapEntry implements Map.Entry {
	private Map map;
	private Object key;

	public MapEntry(Map map, Object key) {
		this.map = map;
		this.key = key;
	}

	public Object getKey() {
		return key;
	}

	public Object getValue() {
		return map.get(key);
	}

	public Object setValue(Object value) {
		return map.put(key, value);
	}

}
