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

import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.w3c.dom.Document;

import com.bstek.dorado.config.xml.XmlParser;
import com.bstek.dorado.core.EngineStartupListener;
import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.core.io.ResourceUtils;
import com.bstek.dorado.core.xml.XmlDocumentBuilder;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-1-23
 */
public class ResourceTypeLoader extends EngineStartupListener {
	private ResourceTypeManager resourceTypeManager;
	private String configLocation;
	private List<String> configLocations;
	private XmlDocumentBuilder xmlDocumentBuilder;
	private XmlParser resourceTypeParser;

	public void setResourceTypeManager(ResourceTypeManager resourceTypeManager) {
		this.resourceTypeManager = resourceTypeManager;
	}

	public void setConfigLocation(String configLocation) {
		this.configLocation = configLocation;
	}

	public void setConfigLocations(List<String> configLocations) {
		this.configLocations = configLocations;
	}

	public void setXmlDocumentBuilder(XmlDocumentBuilder xmlDocumentBuilder) {
		this.xmlDocumentBuilder = xmlDocumentBuilder;
	}

	public void setResourceTypeParser(XmlParser resourceTypeParser) {
		this.resourceTypeParser = resourceTypeParser;
	}

	protected synchronized void loadConfigs(
			ResourceTypeManager resourceTypeManager, Resource[] resources)
			throws Exception {
		ResourceTypeParser.ResourceTypeParseContext context = new ResourceTypeParser.ResourceTypeParseContext();
		context.setResourceTypeManager(resourceTypeManager);
		for (Resource resource : resources) {
			if (resource.exists()) {
				Document document = xmlDocumentBuilder.loadDocument(resource);
				context.setResource(resource);
				resourceTypeParser
						.parse(document.getDocumentElement(), context);
			}
		}
	}

	@Override
	public void onStartup() throws Exception {
		if (StringUtils.isNotEmpty(configLocation)) {
			loadConfigs(resourceTypeManager,
					ResourceUtils.getResources(configLocation));
		}

		if (configLocations != null) {
			String[] locations = new String[configLocations.size()];
			configLocations.toArray(locations);
			loadConfigs(resourceTypeManager,
					ResourceUtils.getResources(locations));
		}
	}
}
