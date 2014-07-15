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

import org.apache.commons.lang.ClassUtils;
import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.view.widget.Component;

/**
 * 组件类型注册信息。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jan 21, 2008
 */
public class ComponentTypeRegisterInfo {
	private String name;
	private Class<? extends Component> classType;
	private int clientTypes;
	private String category;
	private String dependsPackage;

	public ComponentTypeRegisterInfo(String name) {
		this.name = name;
	}

	/**
	 * 返回组件名。
	 */
	public String getName() {
		return name;
	}

	/**
	 * @param classType
	 */
	public void setClassType(Class<? extends Component> classType) {
		this.classType = classType;
		if (StringUtils.isEmpty(name)) {
			name = ClassUtils.getShortClassName(classType);
		}
	}

	/**
	 * 返回组件的Class类型。
	 */
	public Class<? extends Component> getClassType() {
		return classType;
	}

	public int getClientTypes() {
		return clientTypes;
	}

	public void setClientTypes(int clientTypes) {
		this.clientTypes = clientTypes;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	/**
	 * 返回该组件依赖的JavaScript Package。
	 * 
	 * @see com.bstek.dorado.view.registry.DefaultComponentTypeRegister#setDependsPackage(String)
	 */
	public String getDependsPackage() {
		return dependsPackage;
	}

	/**
	 * 设置该组件依赖的JavaScript Package。
	 * 
	 * @see com.bstek.dorado.view.registry.DefaultComponentTypeRegister#setDependsPackage(String)
	 */
	public void setDependsPackage(String dependsPackage) {
		this.dependsPackage = dependsPackage;
	}
}
