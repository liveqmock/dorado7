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

package com.bstek.dorado.common.event;

import java.util.List;
import java.util.Map;

/**
 * 支持客户端事件的对象的通用接口。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apr 10, 2008
 */
public interface ClientEventSupported {
	/**
	 * 添加一个事件监听器。
	 * @param eventName 事件名。
	 * @param eventListener 事件监听器。
	 */
	void addClientEventListener(String eventName, ClientEvent eventListener);

	/**
	 * 根据事件名返回所有已添加的事件监听器。
	 * @param eventName 事件名。
	 * @return 事件监听器的列表集合。
	 */
	List<ClientEvent> getClientEventListeners(String eventName);

	/**
	 * 清除所有某事件中的监听器。
	 * @param eventName 事件名。
	 */
	void clearClientEventListeners(String eventName);

	/**
	 * 返回所有已添加的事件监听器。
	 * @return 包含各种事件下所有事件监听器的Map集合。
	 */
	Map<String, List<ClientEvent>> getAllClientEventListeners();
}
