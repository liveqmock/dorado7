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

package com.bstek.dorado.core;

import java.io.IOException;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.Set;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.BeanDefinitionStoreException;
import org.springframework.beans.factory.xml.XmlBeanDefinitionReader;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.GenericApplicationContext;
import org.springframework.context.support.GenericXmlApplicationContext;

import com.bstek.dorado.core.io.DefaultResource;
import com.bstek.dorado.core.io.Resource;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-3-1
 */
public abstract class SpringApplicationContext extends SpringContextSupport {
	private static final String CONFIG_PROPERTY = "core.contextConfigLocation";
	private static final String EXT_CONFIG_PROPERTY = "core.extensionContextConfigLocation";

	private static final String LOCATION_SEPARATOR = ",;";
	private static ApplicationContext applicationContext;

	private static Log logger = LogFactory
			.getLog(SpringApplicationContext.class);

	private Resource[] getConfigLocations(String configLocation)
			throws IOException {
		Set<Resource> resourceSet = new LinkedHashSet<Resource>();

		String[] configLocations = StringUtils.split(configLocation,
				LOCATION_SEPARATOR);
		for (String location : configLocations) {
			if (StringUtils.isNotBlank(location)) {
				CollectionUtils.addAll(resourceSet, getResources(location));
			}
		}

		for (Iterator<Resource> it = resourceSet.iterator(); it.hasNext();) {
			Resource resource = it.next();
			if (!resource.exists()) {
				logger.warn("Resource [" + resource + "] does not exist.");
				it.remove();
			}
		}

		Resource[] resources = new Resource[resourceSet.size()];
		resourceSet.toArray(resources);
		return resources;
	}

	private void loadBeanDefintiionsFromResource(
			XmlBeanDefinitionReader xmlReader, Resource resource)
			throws BeanDefinitionStoreException, IOException {
		if (resource instanceof DefaultResource) {
			xmlReader.loadBeanDefinitions(((DefaultResource) resource)
					.getAdaptee());
		} else {
			xmlReader.loadBeanDefinitions(resource.getPath());
		}
	}

	protected GenericApplicationContext internalCreateApplicationContext() {
		return new GenericXmlApplicationContext();
	}

	/**
	 * 初始化Dorado Engine内部使用的ApplicationContext。
	 * 
	 * @throws Exception
	 */
	public void initApplicationContext() throws Exception {
		getApplicationContext();
	}

	/**
	 * 返回Dorado Engine内部使用的ApplicationContext。
	 * 
	 * @throws Exception
	 */
	@Override
	public ApplicationContext getApplicationContext() throws Exception {
		if (applicationContext == null) {
			GenericApplicationContext ctx = internalCreateApplicationContext();
			applicationContext = ctx;

			XmlBeanDefinitionReader xmlReader = new XmlBeanDefinitionReader(ctx);

			String configLocation = Configure.getString(CONFIG_PROPERTY);
			if (StringUtils.isBlank(configLocation)) {
				throw new IllegalArgumentException("[" + CONFIG_PROPERTY
						+ "] undefined.");
			}

			for (Resource resource : getConfigLocations(configLocation)) {
				loadBeanDefintiionsFromResource(xmlReader, resource);
			}

			String extConfigLocation = Configure.getString(EXT_CONFIG_PROPERTY);
			if (!StringUtils.isBlank(extConfigLocation)) {
				for (Resource resource : getConfigLocations(extConfigLocation)) {
					loadBeanDefintiionsFromResource(xmlReader, resource);
				}
			}

			ctx.refresh();
		}
		return applicationContext;
	}

}
