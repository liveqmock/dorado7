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

import org.aopalliance.intercept.MethodInterceptor;
import org.apache.commons.lang.StringUtils;

/**
 * 用于根据一段Bean的描述信息获得相应的Bean实例的工具。
 * <p>
 * Bean的描述信息用于描述Bean实例的创建（获得）方式，在dorado默认的实现机制中将包含以下两种描述信息:
 * <ul>
 * <li>无前缀或class:前缀，例如:java.util.Date或class:java.util.Date表示直接通过类名即反射来创建Bean。</li>
 * <li>spring:前缀，例如:spring:beanXX表示通过spring来获取一个id为beanXX的Bean实例。</li>
 * </ul>
 * dorado中Bean的描述信息是可以根据需求任意扩展的，请参考: {@link com.bstek.dorado.core.bean.BeanFactory}和
 * {@link com.bstek.dorado.core.bean.BeanFactoryRegistry}
 * </p>
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Dec 26, 2007
 */
public abstract class BeanFactoryUtils {
	private static final String PREFIX_SEPARATOR = ":";

	private static BeanFactoryRegistry beanFactoryRegistry;
	private static ScopeManager scopeManager;

	private static class BeanFactoryWrapper {
		private BeanFactory beanFactory;
		private String beanName;

		public BeanFactoryWrapper(BeanFactory beanFactory, String beanName) {
			this.beanFactory = beanFactory;
			this.beanName = beanName;
		}

		public BeanFactory getBeanFactory() {
			return beanFactory;
		}

		public String getBeanName() {
			return beanName;
		}
	}

	static void setBeanFactoryRegistry(BeanFactoryRegistry beanFactoryRegistry) {
		BeanFactoryUtils.beanFactoryRegistry = beanFactoryRegistry;
	}

	/**
	 * 设置对象作用范围的管理器。
	 */
	static void setScopeManager(ScopeManager scopeManager) {
		BeanFactoryUtils.scopeManager = scopeManager;
	}

	/**
	 * 返回对象作用范围的管理器。
	 */
	public static ScopeManager getScopeManager() {
		return scopeManager;
	}

	/**
	 * 根据Bean的描述信息的前缀返回相应的Bean工厂。
	 * @param prefix Bean的描述信息的前缀
	 * @return Bean工厂
	 */
	public static BeanFactory getBeanFactory(String prefix) {
		return beanFactoryRegistry.getBeanFactory(prefix);
	}

	private static BeanFactoryWrapper getBeanFactoryWrapper(String beanName) {
		String prefix = null;
		String realBeanName;
		if (StringUtils.isNotEmpty(beanName)) {
			int index = beanName.indexOf(PREFIX_SEPARATOR);
			if (index > 0) {
				prefix = beanName.substring(0, index);
				realBeanName = beanName.substring(index + 1);
			}
			else {
				realBeanName = beanName;
			}
		}
		else {
			throw new IllegalArgumentException("Can not get BeanFactory for ["
					+ beanName + "].");
		}

		BeanFactory beanFactory = getBeanFactory(prefix);
		if (beanFactory == null) {
			throw new IllegalArgumentException("Can not get BeanFactory for ["
					+ beanName + "].");
		}
		return new BeanFactoryWrapper(beanFactory, realBeanName);
	}

	/**
	 * 根据给定的Bean的描述信息创建相应的Bean实例。
	 * @param beanName Bean的描述信息
	 * @return 相应的Bean实例
	 * @throws Exception
	 */
	public static Object getBean(String beanName) throws Exception {
		BeanFactoryWrapper beanFactoryWrapper = getBeanFactoryWrapper(beanName);
		return beanFactoryWrapper.getBeanFactory().getBean(
				beanFactoryWrapper.getBeanName());
	}

	/**
	 * 根据给定的Bean的描述信息创建相应的Bean实例。
	 * @param beanName Bean的描述信息
	 * @param methodInterceptors 将要绑定在Bean实例上的方法拦截器
	 * @return 相应的Bean实例
	 * @throws Exception
	 */
	public static Object getBean(String beanName,
			MethodInterceptor[] methodInterceptors) throws Exception {
		BeanFactoryWrapper beanFactoryWrapper = getBeanFactoryWrapper(beanName);
		return beanFactoryWrapper.getBeanFactory().getBean(
				beanFactoryWrapper.getBeanName(), methodInterceptors);
	}

	/**
	 * 根据给定的Bean的描述信息创建相应的Bean实例。
	 * @param beanName Bean的描述信息
	 * @param methodInterceptor 将要绑定在Bean实例上的方法拦截器
	 * @return 相应的Bean实例
	 * @throws Exception
	 */
	public static Object getBean(String beanName,
			MethodInterceptor methodInterceptor) throws Exception {
		BeanFactoryWrapper beanFactoryWrapper = getBeanFactoryWrapper(beanName);
		return beanFactoryWrapper.getBeanFactory().getBean(
				beanFactoryWrapper.getBeanName(),
				new MethodInterceptor[] { methodInterceptor });
	}

	/**
	 * 根据给定的Bean的描述信息创建相应的Bean。
	 * @param beanName Bean的描述信息
	 * @param scope Bean的生命周期
	 * @return Bean的包装器
	 * @throws Exception
	 * @see com.bstek.dorado.core.bean.BeanWrapper
	 */
	public static BeanWrapper getBean(String beanName, Scope scope)
			throws Exception {
		return getBean(beanName, null, scope, null);
	}

	/**
	 * 根据给定的Bean的描述信息创建相应的Bean。
	 * @param beanName Bean的描述信息
	 * @param methodInterceptors 将要绑定在Bean实例上的方法拦截器
	 * @param scope Bean的生命周期
	 * @param beanId 对Bean进行生命周期管理时所使用的id，如果不定义则使用beanName作为该id。
	 * @return Bean的包装器
	 * @throws Exception
	 * @see com.bstek.dorado.core.bean.BeanWrapper
	 */
	public static BeanWrapper getBean(String beanName,
			MethodInterceptor[] methodInterceptors, Scope scope, String beanId)
			throws Exception {
		if (beanId == null) beanId = beanName;
		Object bean = null;
		if (scope != null) bean = scopeManager.getBean(scope, beanId);
		boolean create = (bean == null);
		if (create) {
			BeanFactoryWrapper beanFactoryWrapper = getBeanFactoryWrapper(beanName);
			bean = beanFactoryWrapper.getBeanFactory().getBean(
					beanFactoryWrapper.getBeanName(), methodInterceptors);
			if (scope != null) scopeManager.putBean(scope, beanId, bean);
		}
		return new BeanWrapper(bean, create);
	}
}
