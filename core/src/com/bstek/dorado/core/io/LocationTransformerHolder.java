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

import java.util.HashMap;
import java.util.Map;

import com.bstek.dorado.core.Configure;

/**
 * 
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-3-22
 */
public class LocationTransformerHolder {
	private static final char PROTOCOL_SEPARATOR = ':';
	private static final String HOME_LOCATION_PREFIX = "home"
			+ PROTOCOL_SEPARATOR;
	private static final int HOME_LOCATION_PREFIX_LEN = HOME_LOCATION_PREFIX
			.length();

	private static Map<String, LocationTransformer> pathTransformers = new HashMap<String, LocationTransformer>();

	static {
		pathTransformers.put(HOME_LOCATION_PREFIX, new LocationTransformer() {
			public String transform(String protocal, String location) {
				String configureHome = Configure.getString("core.doradoHome");
				return ResourceUtils.concatPath(configureHome,
						location.substring(HOME_LOCATION_PREFIX_LEN));
			}
		});
	}

	public static Map<String, LocationTransformer> getPathTransformers() {
		return pathTransformers;
	}

	public static String transformLocation(String location) {
		for (Map.Entry<String, LocationTransformer> entry : pathTransformers
				.entrySet()) {
			String protocal = entry.getKey();
			if (location.startsWith(protocal)) {
				location = entry.getValue().transform(protocal, location);
				break;
			}
		}
		return location;
	}
}
