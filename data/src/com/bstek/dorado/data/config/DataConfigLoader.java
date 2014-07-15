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

import java.util.List;

import org.springframework.beans.factory.InitializingBean;

import com.bstek.dorado.spring.RemovableBean;

/**
 * 用于配置在Spring中，定义要装载的数据配置文件的Bean。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apr 11, 2008
 */
public class DataConfigLoader implements InitializingBean, RemovableBean {
	private String configLocation;
	private List<String> configLocations;
	private ConfigurableDataConfigManager dataConfigManager;

	public String getConfigLocation() {
		return configLocation;
	}

	public void setConfigLocation(String configLocation) {
		this.configLocation = configLocation;
	}

	/**
	 * 设置要装载的配置文件。
	 * 
	 * @param configLocations
	 *            此参数是文件路径的集合，每个文件路径都是String类型的路径描述。
	 */
	public void setConfigLocations(List<String> configLocations) {
		this.configLocations = configLocations;
	}

	/**
	 * 设置数据配置文件的管理器。
	 */
	public void setDataConfigManager(
			ConfigurableDataConfigManager dataConfigManager) {
		this.dataConfigManager = dataConfigManager;
	}

	public void afterPropertiesSet() throws Exception {
		if (configLocation != null) {
			dataConfigManager.addConfigLocation(configLocation);
		}
		if (configLocations != null) {
			dataConfigManager.addConfigLocations(configLocations);
		}
	}
}
