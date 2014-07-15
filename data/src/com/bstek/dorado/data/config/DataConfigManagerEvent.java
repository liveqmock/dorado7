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

import java.util.EventObject;

import com.bstek.dorado.core.io.Resource;

/**
 * 数据配置文件的管理器的事件描述对象。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 20, 2007
 * @see com.bstek.dorado.data.config.DataConfigManagerListener
 */
public class DataConfigManagerEvent extends EventObject {
	private static final long serialVersionUID = 5347605992415694456L;

	/**
	 * 装载配置模式。 表示触发事件时操作模式的常量，即表示此时正在执行
	 * {@link com.bstek.dorado.data.config.DataConfigManager}的loadConfig()方法。
	 */
	public static final int MODE_LOAD = 1;

	/**
	 * 卸载配置模式。 表示触发事件时操作模式的常量，即表示此时正在执行
	 * {@link com.bstek.dorado.data.config.DataConfigManager}的unloadConfig()方法。
	 */
	public static final int MODE_UNLOAD = 2;

	private Resource[] resource;

	private int mode;

	/**
	 * @param source
	 *            触发事件的数据配置文件的管理器
	 */
	public DataConfigManagerEvent(Object source) {
		super(source);
	}

	/**
	 * 返回触发事件时正被处理的资源的数组。<br>
	 * 该资源的数组即是传给{@link com.bstek.dorado.data.config.DataConfigManager}
	 * 的loadConfig()或unloadConfig()的参数。
	 */
	public Resource[] getResource() {
		return resource;
	}

	/**
	 * 设置触发事件时正被处理的资源的数组。<br>
	 * 该资源的数组应是传给{@link com.bstek.dorado.data.config.DataConfigManager}
	 * 的loadConfig()或unloadConfig()的参数。
	 */
	public void setResource(Resource[] resource) {
		this.resource = resource;
	}

	/**
	 * 返回触发事件时的操作模式。
	 * 
	 * @see #MODE_LOAD
	 * @see #MODE_UNLOAD
	 */
	public int getMode() {
		return mode;
	}

	/**
	 * 设置触发事件时的操作模式。
	 * 
	 * @see #MODE_LOAD
	 * @see #MODE_UNLOAD
	 */
	public void setMode(int mode) {
		this.mode = mode;
	}

}
