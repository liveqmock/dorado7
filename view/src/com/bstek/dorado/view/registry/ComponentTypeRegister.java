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

package com.bstek.dorado.view.registry;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.BeanFactoryAware;
import org.springframework.beans.factory.BeanNameAware;
import org.springframework.beans.factory.InitializingBean;

import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.spring.RemovableBean;
import com.bstek.dorado.util.clazz.ClassUtils;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.Component;

/**
 * 用于配置在Spring文件中的组件类型信息的注册器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jan 22, 2008
 */
public abstract class ComponentTypeRegister implements InitializingBean,
		BeanFactoryAware, BeanNameAware, RemovableBean {
	private static final Log logger = LogFactory
			.getLog(ComponentTypeRegister.class);

	private BeanFactory beanFactory;
	private ComponentTypeRegistry componentTypeRegistry;
	private String beanName;
	private String name;
	private String classType;
	private String category;
	private String clientTypes;

	public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
		this.beanFactory = beanFactory;
	}

	public BeanFactory getBeanFactory() {
		return beanFactory;
	}

	/**
	 * 设置组件类型注册管理器。
	 */
	public void setComponentTypeRegistry(
			ComponentTypeRegistry componentTypeRegistry) {
		this.componentTypeRegistry = componentTypeRegistry;
	}

	public ComponentTypeRegistry getComponentTypeRegistry() {
		return componentTypeRegistry;
	}

	public void setBeanName(String beanName) {
		this.beanName = beanName;
	}

	public String getBeanName() {
		return beanName;
	}

	/**
	 * 设置组件名称。
	 */
	public void setName(String name) {
		this.name = name;
	}

	public String getName() {
		return name;
	}

	/**
	 * 设置组件的Class类型。
	 */
	public void setClassType(String classType) {
		this.classType = classType;
	}

	public String getClassType() {
		return classType;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getClientTypes() {
		return clientTypes;
	}

	public void setClientTypes(String clientTypes) {
		this.clientTypes = clientTypes;
	}

	protected abstract ComponentTypeRegisterInfo createRegisterInfo(String name);

	@SuppressWarnings("unchecked")
	protected ComponentTypeRegisterInfo getRegisterInfo() throws Exception {
		Class<? extends Component> cl = null;
		if (StringUtils.isNotEmpty(classType)) {
			cl = ClassUtils.forName(classType);
		}

		Widget widget = null;
		if (cl != null) {
			widget = cl.getAnnotation(Widget.class);
			if (widget != null && StringUtils.isEmpty(name)
					&& StringUtils.isNotEmpty(widget.name())) {
				name = widget.name();
			}
		}

		if (StringUtils.isEmpty(name)) {
			int i = beanName.lastIndexOf(".");
			if (i >= 0) {
				name = beanName.substring(i + 1);
			}
		}

		ComponentTypeRegisterInfo registerInfo = createRegisterInfo(name);
		registerInfo.setClassType(cl);
		if (widget != null) {
			registerInfo.setCategory(widget.category());
		}

		int clientTypesValue = ClientType.parseClientTypes(clientTypes);
		if (clientTypesValue > 0) {
			registerInfo.setClientTypes(clientTypesValue);
		}
		return registerInfo;
	}

	public void afterPropertiesSet() throws Exception {
		try {
			ComponentTypeRegisterInfo registerInfo = getRegisterInfo();
			componentTypeRegistry.registerType(registerInfo);
		} catch (Exception e) {
			logger.warn(e, e);
		}
	}
}
