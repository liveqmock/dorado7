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

package com.bstek.dorado.view.resolver;

import java.util.List;
import java.util.Map;
import java.util.Properties;

import org.apache.commons.beanutils.MethodUtils;
import org.apache.velocity.app.VelocityEngine;
import org.springframework.beans.factory.FactoryBean;

import com.bstek.dorado.util.clazz.ClassUtils;
import com.bstek.dorado.web.ConsoleUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-5-14
 */
public class VelocityHelperFactoryBean implements FactoryBean<VelocityHelper> {
	private static Class<?> toolManagerType;

	static {
		try {
			toolManagerType = ClassUtils
					.forName("org.apache.velocity.tools.ToolManager");
			ConsoleUtils.outputLoadingInfo("Velocity tools enabled.");
		} catch (ClassNotFoundException e) {
			// do nothing
		}
	}

	private Properties velocityProperties;
	private Properties velocityToolProperties;
	private List<VelocityContextInitializer> contextInitializer;

	public Properties getVelocityProperties() {
		return velocityProperties;
	}

	public void setVelocityProperties(Properties velocityProperties) {
		this.velocityProperties = velocityProperties;
	}

	public Properties getVelocityToolProperties() {
		return velocityToolProperties;
	}

	public void setVelocityToolProperties(Properties velocityToolProperties) {
		this.velocityToolProperties = velocityToolProperties;
	}

	public List<VelocityContextInitializer> getContextInitializer() {
		return contextInitializer;
	}

	public void setContextInitializer(
			List<VelocityContextInitializer> contextInitializer) {
		this.contextInitializer = contextInitializer;
	}

	public Class<?> getObjectType() {
		return SimpleVelocityHelper.class;
	}

	public boolean isSingleton() {
		return true;
	}

	protected VelocityEngine getVelocityEngine() throws Exception {
		VelocityEngine velocityEngine = new VelocityEngine();
		if (velocityProperties != null) {
			velocityEngine.init(velocityProperties);
		}
		return velocityEngine;
	}

	@SuppressWarnings("rawtypes")
	public VelocityHelper getObject() throws Exception {
		if (toolManagerType != null) {
			Object toolManager = toolManagerType.newInstance();
			if (velocityToolProperties != null) {
				Class<?> configType = ClassUtils
						.forName("org.apache.velocity.tools.config.PropertiesFactoryConfiguration");
				Object config = configType.newInstance();
				for (Map.Entry entry : velocityToolProperties.entrySet()) {
					MethodUtils.invokeMethod(config, "setProperty",
							new Object[] { entry.getKey(), entry.getValue() });
				}
				MethodUtils.invokeMethod(toolManager, "configure",
						new Object[] { config });
			}
			MethodUtils.invokeMethod(toolManager, "setVelocityEngine",
					new Object[] { getVelocityEngine() });

			return new VelocityWithToolsHelper(toolManager);
		} else {
			return new SimpleVelocityHelper(getVelocityEngine());
		}
	}
}
