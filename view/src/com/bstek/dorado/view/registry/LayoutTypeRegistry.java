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

import java.util.Collection;

import com.bstek.dorado.view.widget.layout.Layout;

/**
 * 布局管理器类型的注册管理器。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Sep 16, 2008
 */
public interface LayoutTypeRegistry {

	String getDefaultType();

	void setDefaultType(String defaultType);

	/**
	 * 注册一个布局管理器类型。
	 * @param registerInfo 布局管理器类型的注册信息对象。
	 */
	void registerType(LayoutTypeRegisterInfo registerInfo);

	/**
	 * 根据视图类型和布局管理器类型名返回相应的注册信息对象。
	 * @param type 布局管理器类型名。
	 * @return 注册信息对象。
	 */
	LayoutTypeRegisterInfo getRegisterInfo(String type);

	/**
	 * 根据视图类型和布局管理器实现类返回相应的注册信息对象。
	 * @param classType 布局管理器的实现类。
	 * @return 注册信息对象。
	 */
	LayoutTypeRegisterInfo getRegisterInfo(Class<? extends Layout> classType);

	/**
	 * 返回布局管理器类型的注册信息的集合。
	 * @return 注册信息对象的集合。
	 */
	Collection<LayoutTypeRegisterInfo> getRegisterInfos();
}
