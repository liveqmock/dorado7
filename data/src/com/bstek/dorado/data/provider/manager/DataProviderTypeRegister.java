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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.InitializingBean;

import com.bstek.dorado.data.provider.DataProvider;
import com.bstek.dorado.spring.RemovableBean;
import com.bstek.dorado.util.clazz.ClassUtils;

/**
 * 用于利用外部的Spring配置文件完成DataProvider类型注册功能的辅助类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Dec 16, 2007
 * @see com.bstek.dorado.data.provider.manager.DataProviderTypeRegistry
 */
public class DataProviderTypeRegister implements InitializingBean,
		RemovableBean {
	private static final Log logger = LogFactory
			.getLog(DataProviderTypeRegister.class);
	private DataProviderTypeRegistry dataProviderTypeRegistry;

	private String classType;
	private String type;

	/**
	 * 设置DataProvider的类型注册管理器。
	 */
	public void setDataProviderTypeRegistry(
			DataProviderTypeRegistry dataProviderTypeRegistry) {
		this.dataProviderTypeRegistry = dataProviderTypeRegistry;
	}

	/**
	 * 设置DataProvider的Class类型。
	 */
	public void setClassType(String classType) {
		this.classType = classType;
	}

	/**
	 * 设置类型名。
	 */
	public void setType(String type) {
		this.type = type;
	}

	@SuppressWarnings("unchecked")
	public void afterPropertiesSet() throws Exception {
		try {
			Class<? extends DataProvider> cl = ClassUtils.forName(classType);
			DataProviderTypeRegisterInfo registerInfo = new DataProviderTypeRegisterInfo(
					type, cl);
			dataProviderTypeRegistry.registerType(registerInfo);
		} catch (ClassNotFoundException e) {
			logger.error(e, e);
		}
	}
}
