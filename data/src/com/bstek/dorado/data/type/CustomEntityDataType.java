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

package com.bstek.dorado.data.type;

import java.util.Map;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2013-11-10
 */
public interface CustomEntityDataType<T> extends EntityDataType {

	/**
	 * 尝试将一个Map转换成本DataType所描述的类型。
	 * @param map 要转换的Map。
	 * @return 转换后得到的数据。
	 */
	T fromMap(Map<String, Object> map) throws Exception;

	/**
	 * 将一个数据对象转换成Map。
	 * @param customEntity 数据对象。
	 * @return 转换后得到的Map。
	 */
	Map<String, Object> toMap(T customEntity) throws Exception;

}
