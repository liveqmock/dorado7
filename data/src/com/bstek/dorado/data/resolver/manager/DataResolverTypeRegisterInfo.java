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

import com.bstek.dorado.data.resolver.DataResolver;

/**
 * DataProvider的类型注册信息。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 27, 2008
 * @see com.bstek.dorado.data.provider.manager.DataProviderTypeRegistry
 * @see com.bstek.dorado.data.provider.manager.DataProviderTypeRegister
 */
public class DataResolverTypeRegisterInfo {
	private String type;
	private Class<? extends DataResolver> classType;

	public DataResolverTypeRegisterInfo(String type,
			Class<? extends DataResolver> classType) {
		this.type = type;
		this.classType = classType;
	}

	public String getType() {
		return type;
	}

	/**
	 * 设置DataProvider的类型名
	 */
	public void setType(String type) {
		this.type = type;
	}

	public Class<? extends DataResolver> getClassType() {
		return classType;
	}

	public void setClassType(Class<? extends DataResolver> classType) {
		this.classType = classType;
	}

}
