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

package com.bstek.dorado.data.type.validator;

import java.util.Collection;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-7-27
 */
public interface ValidatorTypeRegistry {
	/**
	 * 注册一种Validator类型。
	 * 
	 * @param registryInfo
	 *            DataProvider的类型注册信息。
	 */
	void registerType(ValidatorTypeRegisterInfo registryInfo);

	/**
	 * 根据组件类型名称返回相应的Validator类型注册信息。
	 * 
	 * @param type
	 *            类型名称。
	 * @return Validator的类型注册信息。
	 */
	ValidatorTypeRegisterInfo getTypeRegisterInfo(String type);

	/**
	 * 返回所有Validator类型的注册信息。
	 */
	Collection<ValidatorTypeRegisterInfo> getTypes();
}
