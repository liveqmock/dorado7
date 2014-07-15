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

package com.bstek.dorado.data.config;

import com.bstek.dorado.core.EngineStartupListener;

/**
 * 用与在Dorado引擎启动时自动完成数据模型配置文件的初始装载过程的监听类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Dec 12, 2007
 * @see com.bstek.dorado.core.EngineStartupListener
 */
public class DataConfigEngineStartupListener extends EngineStartupListener {
	private DataConfigManager dataConfigManager;

	/**
	 * 设置数据配置文件的管理器。
	 */
	public void setDataConfigManager(DataConfigManager dataConfigManager) {
		this.dataConfigManager = dataConfigManager;
	}

	@Override
	public void onStartup() throws Exception {
		dataConfigManager.initialize();
	}

}
