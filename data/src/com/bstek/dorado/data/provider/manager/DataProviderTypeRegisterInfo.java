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

import com.bstek.dorado.data.provider.DataProvider;

/**
 * DataProvider的类型注册信息。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 27, 2008
 * @see com.bstek.dorado.data.provider.manager.DataProviderTypeRegistry
 * @see com.bstek.dorado.data.provider.manager.DataProviderTypeRegister
 */
public class DataProviderTypeRegisterInfo {
	private String type;
	private Class<? extends DataProvider> classType;

	/**
	 * @param type
	 *            DataProvider的类型名
	 * @param classType
	 *            DataProvider的Class类型
	 */
	public DataProviderTypeRegisterInfo(String type,
			Class<? extends DataProvider> classType) {
		this.type = type;
		this.classType = classType;
	}

	/**
	 * 返回DataProvider的类型名
	 */
	public String getType() {
		return type;
	}

	/**
	 * 设置DataProvider的类型名
	 */
	public void setType(String type) {
		this.type = type;
	}

	/**
	 * 返回DataProvider的Class类型。
	 */
	public Class<? extends DataProvider> getClassType() {
		return classType;
	}

	/**
	 * 设置DataProvider的Class类型。
	 */
	public void setClassType(Class<? extends DataProvider> classType) {
		this.classType = classType;
	}
}
