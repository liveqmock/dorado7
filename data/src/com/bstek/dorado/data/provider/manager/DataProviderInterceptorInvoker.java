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

import java.lang.reflect.Method;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;

import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.bean.BeanFactoryUtils;
import com.bstek.dorado.core.el.Expression;
import com.bstek.dorado.core.el.ExpressionHandler;
import com.bstek.dorado.core.resource.ResourceManager;
import com.bstek.dorado.core.resource.ResourceManagerUtils;
import com.bstek.dorado.data.ParameterWrapper;
import com.bstek.dorado.data.method.MethodAutoMatchingException;
import com.bstek.dorado.data.method.MethodAutoMatchingUtils;
import com.bstek.dorado.data.method.MoreThanOneMethodsMatchsException;
import com.bstek.dorado.data.provider.Criteria;
import com.bstek.dorado.data.provider.Criterion;
import com.bstek.dorado.data.provider.DataProvider;
import com.bstek.dorado.data.provider.Junction;
import com.bstek.dorado.data.provider.Page;
import com.bstek.dorado.data.provider.filter.ExpressionFilterCriterion;
import com.bstek.dorado.data.provider.filter.SingleValueFilterCriterion;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.util.Assert;

/**
 * 用于激活用户绑定于DataProvider的拦截器的类，该类本身也是一个方法拦截器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jan 11, 2008
 */
public class DataProviderInterceptorInvoker implements MethodInterceptor {
	private static final Log logger = LogFactory
			.getLog(DataProviderInterceptorInvoker.class);
	private static final ResourceManager resourceManager = ResourceManagerUtils
			.get(DataProviderInterceptorInvoker.class);

	public static final String DEFAULT_METHOD_NAME = "getResult";
	public static final String INTERCEPTING_METHOD_NAME = DEFAULT_METHOD_NAME;
	public static final String INTERCEPTING_PAGING_METHOD_NAME = "getPagingResult";

	private static final String[] EMPTY_NAMES = new String[0];
	private static final Object[] EMPTY_ARGS = new Object[0];

	private static final String[] EXTRA_NAMES = new String[] { "criteria",
			"filterValue" };
	private static final Class<?>[] EXTRA_TYPES = new Class<?>[] { Criteria.class };
	private static final Object[] EXTRA_ARGS = new Object[] { null, null };

	private static final class AbortException extends RuntimeException {
		private static final long serialVersionUID = -3143779968350839581L;
	};

	private static ExpressionHandler expressionHandler;

	private String interceptorName;
	private String methodName;
	private Object interceptor;

	/**
	 * @param interceptorExpression
	 *            用户指定的方法拦截器。
	 */
	public DataProviderInterceptorInvoker(String interceptorExpression) {
		Assert.notEmpty(interceptorExpression,
				"\"interceptorExpression\" could not be empty.");

		int i = interceptorExpression.lastIndexOf("#");
		if (i > 0) {
			interceptorName = interceptorExpression.substring(0, i);
			methodName = interceptorExpression.substring(i + 1);
		} else {
			interceptorName = interceptorExpression;
		}
		if (StringUtils.isEmpty(methodName)) {
			methodName = DEFAULT_METHOD_NAME;
		}
	}

	public ExpressionHandler getExpressionHandler() throws Exception {
		if (expressionHandler == null) {
			expressionHandler = (ExpressionHandler) Context.getCurrent()
					.getServiceBean("expressionHandler");
		}
		return expressionHandler;
	}

	public Object invoke(MethodInvocation methodInvocation) throws Throwable {
		Method proxyMethod = methodInvocation.getMethod();
		String currentMethodName = proxyMethod.getName();
		if (!currentMethodName.equals(INTERCEPTING_METHOD_NAME)
				&& !currentMethodName.equals(INTERCEPTING_PAGING_METHOD_NAME)) {
			return methodInvocation.proceed();
		}

		if (interceptor == null) {
			interceptor = BeanFactoryUtils.getBean(interceptorName);
		}

		Method[] methods = MethodAutoMatchingUtils.getMethodsByName(
				interceptor.getClass(), methodName);
		if (methods.length == 0) {
			throw new NoSuchMethodException(resourceManager.getString(
					"dorado.common/methodNotFoundInInterceptor", interceptorName,
					methodName));
		}

		DataProvider dataProvider = (DataProvider) methodInvocation.getThis();

		MethodAutoMatchingException[] exceptions = new MethodAutoMatchingException[4];
		int i = 0;

		try {
			try {
				return invokeInterceptorByParamName(dataProvider, methods,
						methodInvocation, false);
			} catch (MoreThanOneMethodsMatchsException e) {
				throw e;
			} catch (MethodAutoMatchingException e) {
				exceptions[i++] = e;
			} catch (AbortException e) {
				// do nothing
			}

			try {
				return invokeInterceptorByParamName(dataProvider, methods,
						methodInvocation, true);
			} catch (MoreThanOneMethodsMatchsException e) {
				throw e;
			} catch (MethodAutoMatchingException e) {
				exceptions[i++] = e;
			} catch (AbortException e) {
				// do nothing
			}

			try {
				return invokeInterceptorByParamType(dataProvider, methods,
						methodInvocation, false);
			} catch (MoreThanOneMethodsMatchsException e) {
				throw e;
			} catch (MethodAutoMatchingException e) {
				exceptions[i++] = e;
			} catch (AbortException e) {
				// do nothing
			}

			try {
				return invokeInterceptorByParamType(dataProvider, methods,
						methodInvocation, true);
			} catch (MoreThanOneMethodsMatchsException e) {
				throw e;
			} catch (MethodAutoMatchingException e) {
				exceptions[i++] = e;
			} catch (AbortException e) {
				// do nothing
			}
		} catch (MethodAutoMatchingException e) {
			exceptions[i++] = e;
		}

		for (MethodAutoMatchingException e : exceptions) {
			if (e == null) {
				break;
			}
			logger.error(e.getMessage());
		}
		throw new IllegalArgumentException(resourceManager.getString(
				"dorado.common/noMatchingMethodError", interceptor.getClass()
						.getName(), methodName));
	}

	private Criteria mergeCriteria(Criteria criteria, Criteria sysCriteria) {
		if (sysCriteria == null) {
			return criteria;
		}

		Criteria newCriteria = new Criteria();
		newCriteria.getCriterions().addAll(criteria.getCriterions());
		newCriteria.getCriterions().addAll(sysCriteria.getCriterions());
		newCriteria.getOrders().addAll(sysCriteria.getOrders());
		return newCriteria;
	}

	private Criterion evaluateCriterion(Criterion criterion) throws Exception {
		Criterion newCriterion;
		if (criterion instanceof Junction) {
			Junction junction = (Junction) criterion;
			Junction newJunction = junction.getClass().newInstance();
			for (Criterion subCriterion : junction.getCriterions()) {
				newJunction.addCriterion(evaluateCriterion(subCriterion));
			}
			newCriterion = newJunction;
		} else if (criterion instanceof ExpressionFilterCriterion) {
			ExpressionFilterCriterion expressionFilterCriterion = (ExpressionFilterCriterion) criterion;
			SingleValueFilterCriterion svfc = new SingleValueFilterCriterion();
			svfc.setProperty(expressionFilterCriterion.getProperty());
			svfc.setPropertyPath(expressionFilterCriterion.getPropertyPath());
			svfc.setFilterOperator(expressionFilterCriterion
					.getFilterOperator());
			svfc.setDataType(expressionFilterCriterion.getDataType());

			Object value = null;
			String expression = expressionFilterCriterion.getExpression();
			if (StringUtils.isNotEmpty(expression)) {
				value = getExpressionHandler().compile(expression);
				if (value instanceof Expression) {
					value = ((Expression) value).evaluate();
				}
				svfc.setValue(value);
			}

			newCriterion = svfc;
		} else {
			newCriterion = criterion;
		}
		return newCriterion;
	}

	private Criteria evaluateCriteria(Criteria criteria) throws Exception {
		Criteria newCriteria = new Criteria();

		for (Criterion criterion : criteria.getCriterions()) {
			newCriteria.addCriterion(evaluateCriterion(criterion));
		}

		newCriteria.getOrders().addAll(criteria.getOrders());
		return newCriteria;
	}

	private Object invokeInterceptorByParamName(DataProvider dataProvider,
			Method[] methods, MethodInvocation methodInvocation,
			boolean disassembleParameter) throws Exception {
		Method proxyMethod = methodInvocation.getMethod();
		Object[] proxyArgs = methodInvocation.getArguments();
		Class<?>[] parameterTypes = proxyMethod.getParameterTypes();

		String[] requiredParameterNames = null;
		Object[] requiredParameters = null;
		String[] optionalParameterNames = null;
		Object[] optionalParameters = null;
		String[] extraParameterNames = null;
		Object[] extraParameters = null;

		Object parameter = null;
		Map<String, Object> sysParameter = null;
		int parameterParameterIndex = MethodAutoMatchingUtils.indexOfTypes(
				parameterTypes, Object.class);
		if (parameterParameterIndex >= 0) {
			parameter = proxyArgs[parameterParameterIndex];
		}
		if (parameter instanceof ParameterWrapper) {
			ParameterWrapper parameterWrapper = (ParameterWrapper) parameter;
			parameter = parameterWrapper.getParameter();
			sysParameter = parameterWrapper.getSysParameter();
		}

		if (disassembleParameter
				&& (parameter == null && !(parameter instanceof Map<?, ?>))) {
			throw new AbortException();
		}

		String[] parameterParameterNames = EMPTY_NAMES;
		Object[] parameterParameters = EMPTY_ARGS;

		if (parameter != null) {
			if (parameter instanceof Map<?, ?>) {
				if (disassembleParameter) {
					Map<?, ?> map = (Map<?, ?>) parameter;
					parameterParameterNames = new String[map.size()];
					parameterParameters = new Object[parameterParameterNames.length];

					int i = 0;
					for (Map.Entry<?, ?> entry : map.entrySet()) {
						Object value = entry.getValue();
						if (value instanceof Criteria) {
							if (sysParameter == null) {
								sysParameter = new HashMap<String, Object>();
							}

							Criteria sysCriteria = (Criteria) sysParameter
									.get("criteria");
							sysParameter
									.put("criteria",
											mergeCriteria((Criteria) value,
													sysCriteria));
						} else {
							parameterParameterNames[i] = (String) entry
									.getKey();
							parameterParameters[i] = value;
							i++;
						}
					}
				} else {
					parameterParameterNames = new String[] { "parameter" };
					parameterParameters = new Object[] { parameter };
				}
			} else if (parameter instanceof Criteria) {
				parameterParameterNames = new String[0];
				parameterParameters = new Object[0];

				if (sysParameter == null) {
					sysParameter = new HashMap<String, Object>();
				}
				Criteria sysCriteria = (Criteria) sysParameter.get("criteria");
				sysParameter.put("criteria",
						mergeCriteria((Criteria) parameter, sysCriteria));
			} else {
				parameterParameterNames = new String[] { "parameter" };
				parameterParameters = new Object[] { parameter };
			}
		} else {
			parameterParameterNames = new String[] { "parameter" };
			parameterParameters = new Object[] { null };
		}

		Page<?> page = null;
		int pageParameterIndex = MethodAutoMatchingUtils.indexOfTypes(
				parameterTypes, Page.class);
		if (pageParameterIndex >= 0) {
			page = (Page<?>) proxyArgs[pageParameterIndex];
		}

		DataType dataType = null;
		int dataTypeArgIndex = MethodAutoMatchingUtils.indexOfTypes(
				parameterTypes, DataType.class);
		if (dataTypeArgIndex >= 0) {
			dataType = (DataType) proxyArgs[dataTypeArgIndex];
		}
		if (dataType == null) {
			dataType = dataProvider.getResultDataType();
		}

		requiredParameterNames = new String[((page != null) ? 1 : 0)];
		requiredParameters = new Object[requiredParameterNames.length];
		if (page != null) {
			requiredParameterNames[0] = "page";
			requiredParameters[0] = page;
		}

		optionalParameterNames = new String[parameterParameterNames.length + 3];
		optionalParameters = new Object[optionalParameterNames.length];

		optionalParameterNames[0] = "dataProvider";
		optionalParameterNames[1] = "dataType";
		optionalParameterNames[2] = "methodInvocation";
		optionalParameters[0] = dataProvider;
		optionalParameters[1] = dataType;
		optionalParameters[2] = methodInvocation;

		System.arraycopy(parameterParameterNames, 0, optionalParameterNames, 3,
				parameterParameterNames.length);
		System.arraycopy(parameterParameters, 0, optionalParameters, 3,
				parameterParameters.length);

		if (sysParameter != null && !sysParameter.isEmpty()) {
			Criteria criteria = (Criteria) sysParameter.get("criteria");
			if (criteria != null) {
				sysParameter.put("criteria", evaluateCriteria(criteria));
			}

			for (String extraName : EXTRA_NAMES) {
				if (!sysParameter.containsKey(extraName)) {
					sysParameter.put(extraName, null);
				}
			}

			extraParameterNames = new String[sysParameter.size()];
			extraParameters = new Object[extraParameterNames.length];

			int i = 0;
			for (Map.Entry<?, ?> entry : sysParameter.entrySet()) {
				extraParameterNames[i] = (String) entry.getKey();
				extraParameters[i] = entry.getValue();
				i++;
			}
		} else {
			extraParameterNames = EXTRA_NAMES;
			extraParameters = EXTRA_ARGS;
		}

		return MethodAutoMatchingUtils.invokeMethod(methods, interceptor,
				requiredParameterNames, requiredParameters,
				optionalParameterNames, optionalParameters,
				extraParameterNames, extraParameters);
	}

	private Object invokeInterceptorByParamType(DataProvider dataProvider,
			Method[] methods, MethodInvocation methodInvocation,
			boolean disassembleParameter) throws MethodAutoMatchingException,
			Exception {
		Method proxyMethod = methodInvocation.getMethod();
		Object[] proxyArgs = methodInvocation.getArguments();
		Class<?>[] proxyArgTypes = proxyMethod.getParameterTypes();

		Object parameter = null;
		Map<String, Object> sysParameter = null;

		int parameterArgIndex = MethodAutoMatchingUtils.indexOfTypes(
				proxyArgTypes, Object.class);
		if (parameterArgIndex >= 0) {
			parameter = proxyArgs[parameterArgIndex];
		}

		if (parameter != null && parameter instanceof ParameterWrapper) {
			ParameterWrapper parameterWrapper = (ParameterWrapper) parameter;
			parameter = parameterWrapper.getParameter();
			sysParameter = parameterWrapper.getSysParameter();
		}

		if (disassembleParameter
				&& (parameter == null && !(parameter instanceof Map<?, ?>))) {
			throw new AbortException();
		}

		Map<Type, Object> extraArgMap = new HashMap<Type, Object>();
		for (int i = 0; i < EXTRA_TYPES.length; i++) {
			extraArgMap.put(EXTRA_TYPES[i], EXTRA_ARGS[i]);
		}
		if (sysParameter != null && !sysParameter.isEmpty()) {
			for (Map.Entry<?, ?> entry : sysParameter.entrySet()) {
				Object value = entry.getValue();
				if (value != null) {
					extraArgMap.put(
							MethodAutoMatchingUtils.getTypeForMatching(value),
							value);
				}
			}
		}

		Type[] optionalArgTypes = null;
		Object[] optionalArgs = null;

		if (parameter != null) {
			if (parameter instanceof Map<?, ?>) {
				if (disassembleParameter) {
					Map<?, ?> map = (Map<?, ?>) parameter;
					optionalArgTypes = new Class[map.size()];
					optionalArgs = new Object[optionalArgTypes.length];

					int i = 0;
					for (Object value : map.values()) {
						if (value != null) {
							if (value instanceof Criteria) {
								Criteria sysCriteria = (Criteria) extraArgMap
										.get(Criteria.class);
								extraArgMap.put(
										Criteria.class,
										mergeCriteria((Criteria) value,
												sysCriteria));
							} else {
								optionalArgTypes[i] = MethodAutoMatchingUtils
										.getTypeForMatching(value);
								optionalArgs[i] = value;
								i++;
							}
						}
					}
				} else {
					optionalArgTypes = new Type[] { MethodAutoMatchingUtils
							.getTypeForMatching(parameter) };
					optionalArgs = new Object[] { parameter };
				}
			} else if (parameter instanceof Criteria) {
				optionalArgTypes = new Class[0];
				optionalArgs = new Object[0];

				Criteria sysCriteria = (Criteria) extraArgMap
						.get(Criteria.class);
				extraArgMap.put(Criteria.class,
						mergeCriteria((Criteria) parameter, sysCriteria));
			} else {
				optionalArgTypes = new Type[] { MethodAutoMatchingUtils
						.getTypeForMatching(parameter) };
				optionalArgs = new Object[] { parameter };
			}
		} else {
			optionalArgTypes = new Type[] { Object.class };
			optionalArgs = new Object[] { null };
		}

		Class<?>[] requiredArgTypes = null;
		Object[] requiredArgs = null;

		int pageArgIndex = MethodAutoMatchingUtils.indexOfTypes(proxyArgTypes,
				Page.class);
		if (pageArgIndex >= 0) {
			requiredArgTypes = new Class[] { Page.class };
			requiredArgs = new Object[] { proxyArgs[pageArgIndex] };
		}

		DataType dataType = null;
		int dataTypeArgIndex = MethodAutoMatchingUtils.indexOfTypes(
				proxyArgTypes, DataType.class);
		if (dataTypeArgIndex >= 0) {
			dataType = (DataType) proxyArgs[dataTypeArgIndex];
		}
		if (dataType == null) {
			dataType = dataProvider.getResultDataType();
		}

		Class<?>[] exactArgTypes = new Class[3 + extraArgMap.size()];
		Object[] exactArgs = new Object[exactArgTypes.length];
		exactArgTypes[0] = DataProvider.class;
		exactArgs[0] = dataProvider;
		exactArgTypes[1] = DataType.class;
		exactArgs[1] = dataType;
		exactArgTypes[2] = MethodInvocation.class;
		exactArgs[2] = methodInvocation;

		Criteria criteria = (Criteria) extraArgMap.get(Criteria.class);
		if (criteria != null) {
			extraArgMap.put(Criteria.class, evaluateCriteria(criteria));
		}

		int i = 3;
		for (Map.Entry<?, ?> entry : extraArgMap.entrySet()) {
			exactArgTypes[i] = (Class<?>) entry.getKey();
			exactArgs[i] = entry.getValue();
			i++;
		}

		return MethodAutoMatchingUtils.invokeMethod(methods, interceptor,
				requiredArgTypes, requiredArgs, exactArgTypes, exactArgs,
				optionalArgTypes, optionalArgs, null);
	}
}
