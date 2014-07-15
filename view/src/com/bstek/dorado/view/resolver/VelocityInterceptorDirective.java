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

package com.bstek.dorado.view.resolver;

import java.io.IOException;
import java.io.Writer;
import java.lang.reflect.Method;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.apache.velocity.context.Context;
import org.apache.velocity.context.InternalContextAdapter;
import org.apache.velocity.exception.MethodInvocationException;
import org.apache.velocity.exception.ParseErrorException;
import org.apache.velocity.exception.ResourceNotFoundException;
import org.apache.velocity.runtime.parser.node.Node;

import com.bstek.dorado.core.bean.BeanFactoryUtils;
import com.bstek.dorado.data.method.MethodAutoMatchingUtils;
import com.bstek.dorado.view.View;
import com.bstek.dorado.view.ViewElement;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-1-24
 */
public class VelocityInterceptorDirective extends AbstractDirective {
	@Override
	public String getName() {
		return "interceptor";
	}

	@Override
	public int getType() {
		return LINE;
	}

	@Override
	public boolean render(InternalContextAdapter contextAdapter, Writer writer,
			Node node) throws IOException, ResourceNotFoundException,
			ParseErrorException, MethodInvocationException {
		try {
			intercept(contextAdapter, writer, node);
		} catch (Exception e) {
			processException(contextAdapter, writer, e);
		}
		return true;
	}

	@SuppressWarnings("rawtypes")
	protected void intercept(InternalContextAdapter contextAdapter,
			Writer writer, Node node) throws Exception {
		int paramNum = node.jjtGetNumChildren();
		if (paramNum == 0) {
			throw new IllegalArgumentException(
					"No interceptor name defined in #interceptor.");
		}
		String interceptorName = (String) node.jjtGetChild(0).value(
				contextAdapter);
		if (StringUtils.isEmpty(interceptorName)) {
			throw new IllegalArgumentException(
					"The interceptor name defined in #interceptor can not be empty.");
		}
		if (interceptorName.indexOf('#') <= 0) {
			throw new IllegalArgumentException("Invalid interceptor name ["
					+ interceptorName + "].");
		}
		String beanName = StringUtils.substringBefore(interceptorName, "#");
		String methodName = StringUtils.substringAfter(interceptorName, "#");
		if (StringUtils.isEmpty(methodName)) {
			throw new IllegalArgumentException("Invalid interceptor name ["
					+ interceptorName + "].");
		}

		if (paramNum > 2) {
			throw new IllegalArgumentException(
					"Too more arguments defined in #interceptor.");
		}

		Map parameterMap = null;
		if (paramNum == 2) {
			parameterMap = (Map) node.jjtGetChild(1).value(contextAdapter);
		}

		Object bean = BeanFactoryUtils.getBean(beanName);
		Method[] methods = MethodAutoMatchingUtils.getMethodsByName(
				bean.getClass(), methodName);
		if (methods.length == 0) {
			throw new IllegalArgumentException("No method found for ["
					+ interceptorName + "].");
		} else if (methods.length > 1) {
			throw new IllegalArgumentException(
					"More than one method found for [" + interceptorName + "].");
		}
		Method method = methods[0];
		View view = (View) contextAdapter.get("view");

		Class<?>[] parameterTypes = method.getParameterTypes();
		String[] parameterNames = MethodAutoMatchingUtils
				.getParameterNames(method);
		Object[] parameters = new Object[parameterTypes.length];
		int i = 0;
		for (Class<?> parameterType : parameterTypes) {
			if (Writer.class.isAssignableFrom(parameterType)) {
				/* Writer */
				parameters[i] = writer;
			} else if (Context.class.isAssignableFrom(parameterType)) {
				/* Velocity Context */
				parameters[i] = contextAdapter;
			} else if (ViewElement.class.isAssignableFrom(parameterType)) {
				/* Component or View */
				String parameterName = parameterNames[i];
				if ("view".equals(parameterName)) {
					parameters[i] = view;
				} else {
					parameters[i] = view.getViewElement(parameterName);
				}
			} else if (parameterMap != null) {
				/* from ParameterMap */
				String parameterName = parameterNames[i];
				parameters[i] = parameterMap.get(parameterName);
			}
			i++;
		}

		method.invoke(bean, parameters);
	}
}
