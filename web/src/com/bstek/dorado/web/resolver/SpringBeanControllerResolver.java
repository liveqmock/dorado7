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

package com.bstek.dorado.web.resolver;

import java.util.Hashtable;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.BeanFactoryAware;
import org.springframework.web.servlet.mvc.Controller;

import com.bstek.dorado.core.Configure;
import com.bstek.dorado.util.PathUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2014-1-7
 */
public class SpringBeanControllerResolver extends AbstractControllerResolver
		implements BeanFactoryAware {
	private static byte nameDelimDotOrBackLashMode = 1;
	private static byte nameDelimDotMode = 2;
	private static byte nameDelimBackLashMode = 3;

	private static String nameDelimDot = "dot";
	private static String nameDelimBackLash = "backlash";
	private static String nameDelimDotOrBackLash = "dotOrBacklash";

	private BeanFactory beanFactory;
	private byte nameDelimMode = 0;
	private String namePrefix;

	private Map<String, Controller> controllerCache;

	public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
		this.beanFactory = beanFactory;
	}

	public String getNamePrefix() {
		return namePrefix;
	}

	/**
	 * 设置文件路径的前缀。
	 */
	public void setNamePrefix(String namePrefix) {
		if (namePrefix.endsWith(".")) {
			namePrefix = namePrefix.substring(0, namePrefix.length() - 1);
		}
		this.namePrefix = namePrefix;
	}

	private byte getNameDelimMode() {
		if (nameDelimMode == 0) {
			String setting = Configure.getString("web.controllerNameDelim",
					nameDelimDotOrBackLash);
			if (nameDelimDot.equals(setting)) {
				nameDelimMode = nameDelimDotMode;
			} else if (nameDelimBackLash.equals(setting)) {
				nameDelimMode = nameDelimBackLashMode;
			} else {
				nameDelimMode = nameDelimDotOrBackLashMode;
			}
		}
		return nameDelimMode;
	}

	@Override
	protected Controller getController(String controllerName) throws Exception {
		byte delimMode = getNameDelimMode();

		if (delimMode != nameDelimDotMode) {
			controllerName = controllerName.replace(PathUtils.PATH_DELIM, '.');
		}

		Controller controller = (controllerCache != null) ? controllerCache
				.get(controllerName) : null;
		if (controller == null) {
			char firstChar = controllerName.charAt(0);
			if (firstChar >= 'a' && firstChar <= 'z') {
				controller = beanFactory.getBean(controllerName,
						Controller.class);
			} else {
				if (StringUtils.isNotEmpty(namePrefix)) {
					controllerName = namePrefix + '.' + controllerName;
				}

				try {
					Class<?> beanType = Class.forName(controllerName);
					Object bean = beanFactory.getBean(beanType);
					if (bean != null && bean instanceof Controller) {
						controller = (Controller) bean;
					}
				} catch (ClassNotFoundException e) {
					// do nothing;
				}
			}

			if (controller != null) {
				synchronized (this) {
					if (controllerCache == null) {
						controllerCache = new Hashtable<String, Controller>();
					}
					controllerCache.put(controllerName, controller);
				}
			}
		}

		return controller;
	}
}