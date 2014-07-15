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

import java.util.HashMap;
import java.util.Map;

import org.springframework.util.Assert;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-1-23
 */
public class ResourceTypeManager {
	private Map<String, ResourceType> resourceTypeMap = new HashMap<String, ResourceType>();

	public void registerResourceType(ResourceType resourceType) {
		String type = resourceType.getType();
		Assert.notNull(type);
		resourceTypeMap.put(type.toLowerCase(), resourceType);
	}

	public ResourceType getResourceType(String type) {
		return resourceTypeMap.get(type.toLowerCase());
	}
}
