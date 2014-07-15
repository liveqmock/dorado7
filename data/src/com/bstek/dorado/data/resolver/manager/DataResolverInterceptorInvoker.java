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

package com.bstek.dorado.data.resolver.manager;

import java.lang.reflect.Method;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;

import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.core.bean.BeanFactoryUtils;
import com.bstek.dorado.core.resource.ResourceManager;
import com.bstek.dorado.core.resource.ResourceManagerUtils;
import com.bstek.dorado.data.ParameterWrapper;
import com.bstek.dorado.data.entity.NullWrapper;
import com.bstek.dorado.data.method.MethodAutoMatchingException;
import com.bstek.dorado.data.method.MethodAutoMatchingUtils;
import com.bstek.dorado.data.method.MoreThanOneMethodsMatchsException;
import com.bstek.dorado.data.resolver.DataItems;
import com.bstek.dorado.data.resolver.DataResolver;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.util.Assert;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apr 29, 2009
 */
public class DataResolverInterceptorInvoker implements MethodInterceptor {
	private static final Log logger = LogFactory
			.getLog(DataResolverInterceptorInvoker.class);
	private static final ResourceManager resourceManager = ResourceManagerUtils
			.get(DataResolverInterceptorInvoker.class);

	public static final String INTERCEPTING_METHOD_NAME = "resolve";
	public static final String DEFAULT_METHOD_NAME = INTERCEPTING_METHOD_NAME;

	private static final Object[] EMPTY_ARGS = new Object[0];
	private static final String[] EMPTY_NAMES = new String[0];
	private static final Class<?>[] EMPTY_TYPES = new Class[0];

	private static final class AbortException extends RuntimeException {
		private static final long serialVersionUID = -3143779968350839581L;
	};

	private String interceptorName;
	private String methodName;
	private Object interceptor;

	/**
	 * @param interceptorExpression
	 *            用户指定的方法拦截器。
	 */
	public DataResolverInterceptorInvoker(String interceptorExpression) {
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

	public Object invoke(MethodInvocation methodInvocation) throws Throwable {
		Method proxyMethod = methodInvocation.getMethod();
		if (!proxyMethod.getName().equals(INTERCEPTING_METHOD_NAME)) {
			return methodInvocation.proceed();
		}

		if (interceptor == null) {
			interceptor = BeanFactoryUtils.getBean(interceptorName);
		}

		Method[] methods = MethodAutoMatchingUtils.getMethodsByName(
				interceptor.getClass(), methodName);
		if (methods.length == 0) {
			throw new NoSuchMethodException(resourceManager.getString(
					"dorado.common/methodNotFoundInInterceptor",
					interceptorName, methodName));
		}

		DataResolver dataResolver = (DataResolver) methodInvocation.getThis();
		MethodAutoMatchingException[] exceptions = new MethodAutoMatchingException[4];
		int i = 0;

		try {
			try {
				return invokeInterceptorByParamName(dataResolver, methods,
						methodInvocation, false);
			} catch (MoreThanOneMethodsMatchsException e) {
				throw e;
			} catch (MethodAutoMatchingException e) {
				exceptions[i++] = e;
			} catch (AbortException e) {
				// do nothing
			}

			try {
				return invokeInterceptorByParamName(dataResolver, methods,
						methodInvocation, true);
			} catch (MoreThanOneMethodsMatchsException e) {
				throw e;
			} catch (MethodAutoMatchingException e) {
				exceptions[i++] = e;
			} catch (AbortException e) {
				// do nothing
			}

			try {
				return invokeInterceptorByParamType(dataResolver, methods,
						methodInvocation, false);
			} catch (MoreThanOneMethodsMatchsException e) {
				throw e;
			} catch (MethodAutoMatchingException e) {
				exceptions[i++] = e;
			} catch (AbortException e) {
				// do nothing
			}

			try {
				return invokeInterceptorByParamType(dataResolver, methods,
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

	private Object invokeInterceptorByParamName(DataResolver dataResolver,
			Method[] methods, MethodInvocation methodInvocation,
			boolean disassembleParameter) throws Exception {
		Object[] proxyArgs = methodInvocation.getArguments();
		DataItems dataItems = (DataItems) proxyArgs[0];
		Object parameter = (proxyArgs.length > 1) ? proxyArgs[1] : null;
		Map<String, Object> sysParameter = null;

		if (parameter instanceof ParameterWrapper) {
			ParameterWrapper parameterWrapper = (ParameterWrapper) parameter;
			parameter = parameterWrapper.getParameter();
			sysParameter = parameterWrapper.getSysParameter();
		}

		if (disassembleParameter
				&& (parameter == null && !(parameter instanceof Map<?, ?>))) {
			throw new AbortException();
		}

		String[] optionalParameterNames = null;
		Object[] optionalParameters = null;
		String[] extraParameterNames = null;
		Object[] extraParameters = null;

		String[] parameterParameterNames = EMPTY_NAMES;
		Object[] parameterParameters = EMPTY_ARGS;
		if (parameter != null && parameter instanceof Map<?, ?>) {
			if (disassembleParameter) {
				Map<?, ?> map = (Map<?, ?>) parameter;
				parameterParameterNames = new String[map.size()];
				parameterParameters = new Object[parameterParameterNames.length];

				int i = 0;
				for (Map.Entry<?, ?> entry : map.entrySet()) {
					parameterParameterNames[i] = (String) entry.getKey();
					parameterParameters[i] = entry.getValue();
					i++;
				}
			} else {
				parameterParameterNames = new String[] { "parameter" };
				parameterParameters = new Object[] { parameter };
			}
		} else {
			parameterParameterNames = new String[] { "parameter" };
			parameterParameters = new Object[] { parameter };
		}

		int dataItemsParameterCount = (dataItems != null) ? dataItems.size()
				: 0;
		optionalParameterNames = new String[dataItemsParameterCount
				+ parameterParameterNames.length + 3];
		optionalParameters = new Object[optionalParameterNames.length];
		optionalParameterNames[0] = "dataItems";
		optionalParameterNames[1] = "dataResolver";
		optionalParameterNames[2] = "methodInvocation";
		optionalParameters[0] = dataItems;
		optionalParameters[1] = dataResolver;
		optionalParameters[2] = methodInvocation;

		if (dataItems != null) {
			int i = 3;
			for (Map.Entry<String, Object> entry : dataItems.entrySet()) {
				Object dataItem = entry.getValue();
				if (dataItem != null && dataItem instanceof NullWrapper) {
					dataItem = null;
				}
				optionalParameterNames[i] = entry.getKey();
				optionalParameters[i] = dataItem;
				i++;
			}
		}

		System.arraycopy(parameterParameterNames, 0, optionalParameterNames,
				dataItemsParameterCount + 3, parameterParameterNames.length);
		System.arraycopy(parameterParameters, 0, optionalParameters,
				dataItemsParameterCount + 3, parameterParameters.length);

		if (sysParameter != null && !sysParameter.isEmpty()) {
			extraParameterNames = new String[sysParameter.size()];
			extraParameters = new Object[extraParameterNames.length];

			int i = 0;
			for (Map.Entry<?, ?> entry : sysParameter.entrySet()) {
				extraParameterNames[i] = (String) entry.getKey();
				extraParameters[i] = entry.getValue();
				i++;
			}
		}

		return MethodAutoMatchingUtils.invokeMethod(methods, interceptor, null,
				null, optionalParameterNames, optionalParameters,
				extraParameterNames, extraParameters);
	}

	private Object invokeInterceptorByParamType(DataResolver dataResolver,
			Method[] methods, MethodInvocation methodInvocation,
			boolean disassembleParameter) throws MethodAutoMatchingException,
			Exception {
		Object[] proxyArgs = methodInvocation.getArguments();
		DataItems dataItems = (DataItems) proxyArgs[0];
		Object parameter = (proxyArgs.length > 1) ? proxyArgs[1] : null;
		Map<String, Object> sysParameter = null;

		if (parameter instanceof ParameterWrapper) {
			ParameterWrapper parameterWrapper = (ParameterWrapper) parameter;
			parameter = parameterWrapper.getParameter();
			sysParameter = parameterWrapper.getSysParameter();
		}

		if (disassembleParameter
				&& (parameter == null && !(parameter instanceof Map<?, ?>))) {
			throw new AbortException();
		}

		Map<Type, Object> extraArgMap = new HashMap<Type, Object>();
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

		Type[] parameterArgTypes = EMPTY_TYPES;
		Object[] parameterArgs = EMPTY_ARGS;
		if (parameter != null) {
			if (parameter instanceof Map<?, ?>) {
				if (disassembleParameter) {
					Map<?, ?> map = (Map<?, ?>) parameter;
					parameterArgTypes = new Class[map.size()];
					parameterArgs = new Object[parameterArgTypes.length];

					int i = 0;
					for (Object value : map.values()) {
						if (value != null) {
							parameterArgTypes[i] = MethodAutoMatchingUtils
									.getTypeForMatching(value);
							parameterArgs[i] = value;
							i++;
						}
					}
				} else {
					parameterArgTypes = new Type[] { MethodAutoMatchingUtils
							.getTypeForMatching(parameter) };
					parameterArgs = new Object[] { parameter };
				}
			} else {
				parameterArgTypes = new Type[] { MethodAutoMatchingUtils
						.getTypeForMatching(parameter) };
				parameterArgs = new Object[] { parameter };
			}
		} else {
			parameterArgTypes = new Type[] { Object.class };
			parameterArgs = new Object[] { null };
		}

		int dataItemsArgCount = (dataItems != null) ? dataItems.size() : 0;
		optionalArgTypes = new Type[dataItemsArgCount
				+ parameterArgTypes.length];
		optionalArgs = new Object[optionalArgTypes.length];

		if (dataItems != null) {
			int i = 0;
			for (Object dataItem : dataItems.values()) {
				if (dataItem != null) {
					if (dataItem instanceof NullWrapper) {
						DataType dataType = ((NullWrapper) dataItem)
								.getDataType();
						if (dataType != null) {
							Type typeForMatching = MethodAutoMatchingUtils
									.getTypeForMatching(dataType);
							if (typeForMatching != null) {
								optionalArgTypes[i] = typeForMatching;
								optionalArgs[i] = null;
								i++;
							}
						}
					} else {
						Type typeForMatching = MethodAutoMatchingUtils
								.getTypeForMatching(dataItem);
						optionalArgTypes[i] = typeForMatching;
						optionalArgs[i] = dataItem;
						i++;
					}
				}
			}
		}
		System.arraycopy(parameterArgTypes, 0, optionalArgTypes,
				dataItemsArgCount, parameterArgTypes.length);
		System.arraycopy(parameterArgs, 0, optionalArgs, dataItemsArgCount,
				parameterArgs.length);

		Type[] exactArgTypes = new Class[3 + extraArgMap.size()];
		Object[] exactArgs = new Object[exactArgTypes.length];
		exactArgTypes[0] = DataItems.class;
		exactArgs[0] = dataItems;
		exactArgTypes[1] = DataResolver.class;
		exactArgs[1] = dataResolver;
		exactArgTypes[2] = MethodInvocation.class;
		exactArgs[2] = methodInvocation;

		int i = 3;
		for (Map.Entry<?, ?> entry : extraArgMap.entrySet()) {
			exactArgTypes[i] = (Class<?>) entry.getKey();
			exactArgs[i] = entry.getValue();
			i++;
		}

		return MethodAutoMatchingUtils.invokeMethod(methods, interceptor, null,
				null, exactArgTypes, exactArgs, optionalArgTypes, optionalArgs,
				null);
	}
}
