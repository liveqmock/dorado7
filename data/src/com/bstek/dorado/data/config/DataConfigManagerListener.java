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

/**
 * 数据配置文件的管理器的事件监听器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 20, 2007
 * @see com.bstek.dorado.data.config.DataConfigManagerEvent
 */
public interface DataConfigManagerListener {
	/**
	 * 当配置文件被装载或卸载时触发的事件。
	 * 
	 * @param event
	 *            事件描述对象
	 */
	void onConfigChanged(DataConfigManagerEvent event);
}
