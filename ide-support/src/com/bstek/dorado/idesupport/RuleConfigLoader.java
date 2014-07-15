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

package com.bstek.dorado.idesupport;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.InitializingBean;

import com.bstek.dorado.idesupport.initializer.RuleTemplateInitializer;
import com.bstek.dorado.spring.RemovableBean;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-6-21
 */
public class RuleConfigLoader implements InitializingBean, RemovableBean {
	private RuleTemplateBuilder ruleTemplateBuilder;
	private String configLocation;
	private Map<String, RuleTemplateInitializer> initializerMap;

	public void setRuleTemplateBuilder(RuleTemplateBuilder ruleTemplateBuilder) {
		this.ruleTemplateBuilder = ruleTemplateBuilder;
	}

	/**
	 * 设置要装载的资源包配置文件的路径。
	 */
	public void setConfigLocation(String configLocation) {
		this.configLocation = configLocation;
	}

	/**
	 * 设置生成规则文件的拦截器
	 * 
	 * @param initializerMap
	 */
	public void setInitializerMap(
			Map<String, RuleTemplateInitializer> initializerMap) {
		this.initializerMap = initializerMap;
	}

	public void afterPropertiesSet() throws Exception {
		if (configLocation != null) {
			List<String> configTemplateFiles = ruleTemplateBuilder
					.getConfigTemplateFiles();
			if (configTemplateFiles != null) {
				configTemplateFiles.add(configLocation);
			} else {
				configTemplateFiles = new ArrayList<String>();
				configTemplateFiles.add(configLocation);
				ruleTemplateBuilder.setConfigTemplateFiles(configTemplateFiles);
			}
		}

		if (initializerMap != null) {
			ruleTemplateBuilder.appendInitializerMap(initializerMap);
		}
	}
}
