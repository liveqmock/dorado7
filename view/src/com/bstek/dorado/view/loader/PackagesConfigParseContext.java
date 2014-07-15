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

package com.bstek.dorado.view.loader;

import com.bstek.dorado.config.ParseContext;

/**
 * 资源包配置的解析上下文。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Sep 24, 2008
 */
public class PackagesConfigParseContext extends ParseContext {
	private PackagesConfig packagesConfig;

	/**
	 * @param packagesConfig
	 *            用于保存资源包配置信息的对象。
	 */
	public PackagesConfigParseContext(PackagesConfig packagesConfig) {
		this.packagesConfig = packagesConfig;
	}

	/**
	 * 返回用于保存资源包配置信息的对象。
	 */
	public PackagesConfig getPackagesConfig() {
		return packagesConfig;
	}
}
