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

package com.bstek.dorado.core.io;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;

import com.bstek.dorado.util.PathUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Sep 17, 2008
 */
public abstract class SpringResourceLoaderAdapter implements
		com.bstek.dorado.core.io.ResourceLoader {
	protected static final String LOCATION_SEPARATOR = ",; \t\n";
	protected static final char PROTOCOL_SEPARATOR = ':';
	protected static final String CLASSPATH_LOCATION_PREFIX = "classpath"
			+ PROTOCOL_SEPARATOR;
	protected static final String WEBINF_LOCATION_PREFIX = "WEB-INF/";

	private ResourcePatternResolver patternResolver;

	/**
	 * 返回被代理的Spring的Resource对象。
	 */
	protected abstract org.springframework.core.io.ResourceLoader getAdaptee();

	private ResourcePatternResolver getResourcePatternResolver() {
		if (patternResolver == null) {
			patternResolver = new PathMatchingResourcePatternResolver(
					getAdaptee());
		}
		return patternResolver;
	}

	protected List<Resource> getResourcesBySinglePattern(String locationPattern)
			throws IOException {
		List<Resource> resources = new ArrayList<Resource>();
		ResourcePatternResolver resourcePatternResolver = getResourcePatternResolver();
		for (org.springframework.core.io.Resource r : resourcePatternResolver
				.getResources(locationPattern)) {
			resources.add(new DefaultResource(r));
		}
		return resources;
	}

	protected String transformLocation(String location) {
		if (location.indexOf(PROTOCOL_SEPARATOR) < 0) {
			if (location.charAt(0) != PathUtils.PATH_DELIM
					&& location.indexOf(WEBINF_LOCATION_PREFIX) < 0) {
				location = CLASSPATH_LOCATION_PREFIX + location;
			}
		}
		return location;
	}

	public Resource getResource(String resourceLocation) {
		resourceLocation = transformLocation(resourceLocation);
		return new DefaultResource(getAdaptee().getResource(resourceLocation));
	}

	public Resource[] getResources(String locationPattern) throws IOException {
		Set<Resource> resourceSet = new LinkedHashSet<Resource>();
		String[] patterns = locationPattern.split(LOCATION_SEPARATOR);
		for (String pattern : patterns) {
			if (StringUtils.isNotBlank(pattern)) {
				pattern = transformLocation(pattern);
				resourceSet.addAll(getResourcesBySinglePattern(pattern));
			}
		}

		Resource[] resources = new Resource[resourceSet.size()];
		resourceSet.toArray(resources);
		return resources;
	}

	public ClassLoader getClassLoader() {
		return getAdaptee().getClassLoader();
	}

}
