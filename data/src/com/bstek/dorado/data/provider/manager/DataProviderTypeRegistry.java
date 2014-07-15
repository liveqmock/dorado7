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

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

/**
 * 默认的DataProvider类型的注册管理类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Dec 18, 2007
 */
public class DataProviderTypeRegistry {
	private Map<String, DataProviderTypeRegisterInfo> typeMap = new LinkedHashMap<String, DataProviderTypeRegisterInfo>();
	private String defaultType;

	/**
	 * 设置默认的DataProvider的类型名。<br>
	 * 如果用户在调用的{@link #getTypeRegistryInfo(String)}方法时，
	 * 没有指定DataProvider的类型名（传递null值）， 那么管理器将使用此属性指定的DataProvider的类型名来完成内部的处理。
	 * 
	 * @param defaultType
	 *            默认的DataProvider的类型名
	 */
	public void setDefaultType(String defaultType) {
		this.defaultType = defaultType;
	}

	public String getDefaultType() {
		return defaultType;
	}

	public void registerType(DataProviderTypeRegisterInfo registryInfo) {
		typeMap.put(registryInfo.getType(), registryInfo);
	}

	public DataProviderTypeRegisterInfo getTypeRegistryInfo(String type) {
		if (StringUtils.isEmpty(type)) {
			type = defaultType;
		}
		return typeMap.get(type);
	}

	public Collection<DataProviderTypeRegisterInfo> getTypes() {
		return typeMap.values();
	}
}
