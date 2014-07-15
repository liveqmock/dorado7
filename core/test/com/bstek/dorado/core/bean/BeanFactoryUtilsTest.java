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

package com.bstek.dorado.core.bean;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;

import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.ContextTestCase;
import com.bstek.dorado.core.bean.BeanFactoryRegistry;
import com.bstek.dorado.core.bean.BeanFactoryUtils;
import com.bstek.dorado.core.bean.BeanWrapper;
import com.bstek.dorado.core.bean.Scope;

public class BeanFactoryUtilsTest extends ContextTestCase {
	private void setMethodInterceptorInfo(
			Map<String, Object> methodInterceptorInfos, String info) {
		if (!methodInterceptorInfos.containsKey(info)) {
			methodInterceptorInfos.put(info, new Integer(0));
		}
		Integer i = (Integer) methodInterceptorInfos.get(info);
		methodInterceptorInfos.put(info, new Integer(i.intValue() + 1));
	}

	public void testClassNameBeanFactory() throws Exception {
		String beanName = "java.util.Date";
		Date date1 = (Date) BeanFactoryUtils.getBean(beanName, Scope.instant)
				.getBean();
		Date date2 = (Date) BeanFactoryUtils.getBean(beanName, Scope.instant)
				.getBean();
		assertNotNull(date1);
		assertNotSame(date1, date2);

		beanName = "class:" + beanName;
		Date date3 = (Date) BeanFactoryUtils.getBean(beanName, Scope.singleton)
				.getBean();
		Date date4 = (Date) BeanFactoryUtils.getBean(beanName, Scope.singleton)
				.getBean();
		assertNotNull(date3);
		assertSame(date3, date4);
	}

	public void testClassNameBeanFactoryWithInterceptor() throws Exception {
		final Map<String, Object> methodInterceptorInfos = new HashMap<String, Object>();
		String beanName = "java.util.Date";

		MethodInterceptor methodInterceptor = new MethodInterceptor() {
			public Object invoke(MethodInvocation methodInvocation)
					throws Throwable {
				String info = "1:" + methodInvocation.getMethod().getName();
				setMethodInterceptorInfo(methodInterceptorInfos, info);

				return new Long(1000);
			}
		};

		Date date = (Date) BeanFactoryUtils
				.getBean(beanName, methodInterceptor);

		assertEquals(1000, date.getTime());
		assertEquals(new Integer(1), methodInterceptorInfos.get("1:getTime"));
	}

	public void testSpringBeanFactory() throws Exception {
		Context context = Context.getCurrent();
		BeanFactoryRegistry beanFactoryRegistry = (BeanFactoryRegistry) context
				.getServiceBean("beanFactoryRegistry");
		MockSpringBeanFactory mockSpringBeanFactory = new MockSpringBeanFactory();
		beanFactoryRegistry.registerBeanFactory(mockSpringBeanFactory);

		String beanName = "spring:dorado.beanFactoryRegistry";
		String beanId = "$$spring:dorado.beanFactoryRegistry";
		BeanWrapper beanWrapper = BeanFactoryUtils.getBean(
				beanName, null, Scope.singleton, beanId);
		BeanFactoryRegistry beanFactoryRegistry1 = (BeanFactoryRegistry) beanWrapper
				.getBean();
		assertNotNull(beanFactoryRegistry1);
		assertTrue(beanWrapper.isNewInstance());

		beanWrapper = BeanFactoryUtils.getBean(beanName, null,
				Scope.singleton, beanId);
		BeanFactoryRegistry beanFactoryRegistry2 = (BeanFactoryRegistry) beanWrapper
				.getBean();
		assertFalse(beanWrapper.isNewInstance());

		assertSame(beanFactoryRegistry1, beanFactoryRegistry2);
	}

	public void testSpringBeanFactoryWithInterceptors() throws Exception {
		final Map<String, Object> methodInterceptorInfos = new HashMap<String, Object>();

		MethodInterceptor[] methodInterceptors = new MethodInterceptor[2];
		methodInterceptors[0] = new MethodInterceptor() {
			public Object invoke(MethodInvocation methodInvocation)
					throws Throwable {
				String info = "1:" + methodInvocation.getMethod().getName();
				setMethodInterceptorInfo(methodInterceptorInfos, info);

				return methodInvocation.proceed();
			}
		};

		methodInterceptors[1] = new MethodInterceptor() {
			public Object invoke(MethodInvocation methodInvocation)
					throws Throwable {
				String info = "2:" + methodInvocation.getMethod().getName();
				setMethodInterceptorInfo(methodInterceptorInfos, info);

				return methodInvocation.proceed();
			}
		};

		String beanName = "spring:dorado.beanFactoryRegistry";
		BeanFactoryRegistry beanFactoryRegistry = (BeanFactoryRegistry) BeanFactoryUtils
				.getBean(beanName, methodInterceptors);

		assertNotNull(beanFactoryRegistry);

		beanFactoryRegistry.getBeanFactory(beanName);
		beanFactoryRegistry.getBeanFactory(beanName);

		assertEquals(new Integer(2), methodInterceptorInfos
				.get("1:getBeanFactory"));
		assertEquals(new Integer(2), methodInterceptorInfos
				.get("2:getBeanFactory"));
	}
}
