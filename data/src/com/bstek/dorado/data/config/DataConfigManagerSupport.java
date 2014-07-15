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

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.Vector;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.config.ConfigUtils;
import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.data.provider.manager.DataProviderManager;
import com.bstek.dorado.data.resolver.manager.DataResolverManager;
import com.bstek.dorado.data.type.manager.DataTypeManager;

/**
 * 数据配置文件的管理器的抽象支持类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 20, 2007
 */
public abstract class DataConfigManagerSupport implements DataConfigManager {
	private static Log logger = LogFactory
			.getLog(DataConfigManagerSupport.class);

	private Set<Resource> resourceSet = new LinkedHashSet<Resource>();
	private transient Vector<DataConfigManagerListener> configManagerListeners;

	/**
	 * DataType管理器。
	 */
	protected DataTypeManager dataTypeManager;

	/**
	 * DataProvider管理器。
	 */
	protected DataProviderManager dataProviderManager;

	/**
	 * DataResolver管理器。
	 */
	protected DataResolverManager dataResolverManager;

	/**
	 * 返回当前ConfigManager中已装载的配置文件的资源集合。
	 */
	public Set<Resource> getResources() {
		return resourceSet;
	}

	/**
	 * 设置内部使用的DataType的管理器。
	 */
	public void setDataTypeManager(DataTypeManager dataTypeManager) {
		this.dataTypeManager = dataTypeManager;
	}

	/**
	 * 设置内部使用的DataProvider的管理器。
	 */
	public void setDataProviderManager(DataProviderManager dataProviderManager) {
		this.dataProviderManager = dataProviderManager;
	}

	/**
	 * 设置内部使用的DataResolver的管理器。
	 */
	public void setDataResolverManager(DataResolverManager dataResolverManager) {
		this.dataResolverManager = dataResolverManager;
	}

	public synchronized void addConfigManagerListener(
			DataConfigManagerListener l) {
		if (configManagerListeners == null) {
			configManagerListeners = new Vector<DataConfigManagerListener>(1);
		}
		configManagerListeners.add(l);
	}

	public synchronized void removeConfigManagerListener(
			DataConfigManagerListener l) {
		if (configManagerListeners != null) {
			configManagerListeners.remove(l);
		}
	}

	/**
	 * 触发配置文件改变的事件。即当配置文件被装载或卸载时触发的事件。
	 * 
	 * @param event
	 *            事件描述对象
	 */
	protected void fireOnConfigChanged(DataConfigManagerEvent event) {
		if (configManagerListeners != null) {
			for (DataConfigManagerListener listener : configManagerListeners) {
				listener.onConfigChanged(event);
			}
		}
	}

	public synchronized void loadConfigs(Resource[] resources,
			boolean throwOnError) throws Exception {
		long startTime = System.currentTimeMillis();

		CollectionUtils.addAll(resourceSet, resources);

		ConfigUtils.setDuringBuildTemplate(true);
		try {
			internalUnloadConfigs(resources);
			internalLoadConfig(resources);
		} catch (Exception ex) {
			if (throwOnError) {
				throw ex;
			} else {
				logger.error(ex, ex);
			}
		} finally {
			ConfigUtils.setDuringBuildTemplate(false);
		}

		DataConfigManagerEvent event = new DataConfigManagerEvent(this);
		event.setResource(resources);
		fireOnConfigChanged(event);

		long endTime = System.currentTimeMillis();

		String message = "Configures loaded in " + (endTime - startTime)
				+ " ms.";
		message += " [";
		for (int i = 0; i < resources.length; i++) {
			if (i > 0)
				message += ',';
			message += resources[i];
		}
		message += "].";
		logger.info(message);
	}

	/**
	 * 内部的用于实现装载一组数据配置文件中配置信息的方法。 在派生类中应该使用internalLoadConfig()来替代loadConfig()。
	 * 
	 * @param resources
	 *            用于表示一组配置文件的资源描述数组
	 * @return 返回此方法是否实际改变了任何内存中配置
	 * @throws Exception
	 */
	protected abstract boolean internalLoadConfig(Resource[] resources)
			throws Exception;

	public synchronized void unloadConfigs(Resource[] resources)
			throws Exception {
		if (internalUnloadConfigs(resources)) {
			dataTypeManager.clearCache();
		}

		for (Resource resource : resources) {
			resourceSet.remove(resource);
		}

		DataConfigManagerEvent event = new DataConfigManagerEvent(this);
		event.setResource(resources);
		event.setMode(DataConfigManagerEvent.MODE_UNLOAD);
		fireOnConfigChanged(event);

		String message = "Configures unloaded [";
		for (int i = 0; i < resources.length; i++) {
			if (i > 0) {
				message += ',';
			}
			message += resources[i];
		}
		message += "].";
		logger.info(message);
	}

	/**
	 * 内部的用于实现从已装载的信息中卸载与传入的配置文件相关的那部分配置信息的方法。
	 * 在派生类中应该使用internalUnloadConfig()来替代unloadConfig()。
	 * 
	 * @param resources
	 *            用于表示一组配置文件的资源描述数组
	 * @return 返回此方法是否实际改变了任何内存中配置
	 * @throws Exception
	 */
	protected abstract boolean internalUnloadConfigs(Resource[] resources)
			throws Exception;

}
