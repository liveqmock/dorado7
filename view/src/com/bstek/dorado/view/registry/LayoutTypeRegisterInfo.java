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

import com.bstek.dorado.util.Assert;
import com.bstek.dorado.view.widget.layout.Layout;
import com.bstek.dorado.view.widget.layout.LayoutConstraintSupport;

/**
 * 布局管理器类型的注册信息对象。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Sep 16, 2008
 */
public class LayoutTypeRegisterInfo {
	private String type;
	private Class<? extends Layout> classType;
	private Class<? extends LayoutConstraintSupport> constraintClassType;
	private int clientTypes;
	
	public LayoutTypeRegisterInfo(String type,
			Class<? extends Layout> classType,
			Class<? extends LayoutConstraintSupport> constraintClassType) {
		Assert.notEmpty(type);
		Assert.notNull(classType);
		this.type = type;
		this.classType = classType;
		this.constraintClassType = constraintClassType;
	}

	/**
	 * 返回布局管理器类型名。
	 */
	public String getType() {
		return type;
	}

	/**
	 * 设置布局管理器类型名。
	 */
	public void setType(String type) {
		this.type = type;
	}

	/**
	 * 返回布局管理器的实现类。
	 */
	public Class<? extends Layout> getClassType() {
		return classType;
	}

	/**
	 * 设置返回布局管理器的实现类。
	 */
	public void setClassType(Class<? extends Layout> classType) {
		this.classType = classType;
	}

	public Class<? extends LayoutConstraintSupport> getConstraintClassType() {
		return constraintClassType;
	}

	public void setConstraintClassType(
			Class<? extends LayoutConstraintSupport> constraintClassType) {
		this.constraintClassType = constraintClassType;
	}

	public int getClientTypes() {
		return clientTypes;
	}

	public void setClientTypes(int clientTypes) {
		this.clientTypes = clientTypes;
	}

}
