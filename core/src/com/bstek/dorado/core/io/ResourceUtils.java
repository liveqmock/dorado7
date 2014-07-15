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
import java.util.LinkedHashSet;
import java.util.Set;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.core.Context;

/**
 * Resource相关的工具类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 19, 2007
 */
public abstract class ResourceUtils {
	private ResourceUtils() {
	}

	/**
	 * 将两个路径连接起来，同时根据确保连接处的语法始终正确。 例如自动在连接处添加'/'分隔符。
	 */
	public static String concatPath(String path1, String path2) {
		String result;
		if (StringUtils.isEmpty(path1)) {
			result = path2;
		} else {
			result = path1;
			if (StringUtils.isNotEmpty(path2)) {
				char c1 = path1.charAt(path1.length() - 1), c2 = path2
						.charAt(0);
				boolean b1 = (c1 == '\\' || c1 == '/'), b2 = (c2 == '\\' || c2 == '/');
				if (!b1 && !b2) {
					result += '/';
				} else if (b1 && b2) {
					path2 = path2.substring(1);
				}
				result += path2;
			}
		}
		return result;
	}

	/**
	 * 将一组资源路径转换成资源描述对象。
	 * 
	 * @param resourceLocations
	 *            资源路径数组
	 * @return 资源描述对象集合
	 * @throws IOException
	 */
	public static Set<Resource> getResourceSet(String[] resourceLocations)
			throws IOException {
		Context context = Context.getCurrent();
		Set<Resource> resourceSet = new LinkedHashSet<Resource>();
		for (String resourceLocation : resourceLocations) {
			Resource[] resourceArray = context.getResources(resourceLocation);
			for (Resource resource : resourceArray) {
				if (!resourceSet.contains(resource)) {
					resourceSet.add(resource);
				}
			}
		}
		return resourceSet;
	}

	/**
	 * 将资源路径转换成一组资源描述对象。
	 * 
	 * @param resourceLocation
	 *            资源路径
	 * @return 资源描述对象的集合
	 * @throws IOException
	 */
	public static Set<Resource> getResourceSet(String resourceLocation)
			throws IOException {
		return getResourceSet(new String[] { resourceLocation });
	}

	/**
	 * 将资源路径转换成一组资源描述对象。
	 * 
	 * @param resourceLocation
	 *            资源路径
	 * @return 资源描述对象数组
	 * @throws IOException
	 */
	public static Resource[] getResources(String resourceLocation)
			throws IOException {
		return getResources(new String[] { resourceLocation });
	}

	/**
	 * 将一组资源路径转换成资源描述对象。
	 * 
	 * @param resourceLocations
	 *            资源路径数组
	 * @return 资源描述对象数组
	 * @throws IOException
	 */
	public static Resource[] getResources(String[] resourceLocations)
			throws IOException {
		Set<Resource> resourceSet = getResourceSet(resourceLocations);
		Resource[] resources = new Resource[resourceSet.size()];
		resourceSet.toArray(resources);
		return resources;
	}

	/**
	 * 将资源路径转换成资源描述对象。
	 * 
	 * @param resourceLocation
	 *            资源路径
	 * @return 资源描述对象
	 * @throws IOException
	 */
	public static Resource getResource(String resourceLocation)
			throws IOException {
		Resource resource = null;
		Resource[] resources = getResources(resourceLocation);
		if (resources.length > 0) {
			resource = resources[0];
		}
		return resource;
	}
}
