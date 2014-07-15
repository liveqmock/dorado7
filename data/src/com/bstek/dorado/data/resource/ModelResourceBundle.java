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

package com.bstek.dorado.data.resource;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import com.bstek.dorado.core.resource.DefaultResourceBundle;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-5-10
 */
public class ModelResourceBundle extends DefaultResourceBundle {
	private static final long serialVersionUID = -3873583139272775060L;

	private Map<String, Properties> subPropertiesMap;

	public ModelResourceBundle(Properties properties) {
		super(properties);

		for (Map.Entry<Object, Object> entry : properties.entrySet()) {
			String key = (String) entry.getKey();
			String value = (String) entry.getValue();
			if (key.charAt(0) == '#') {
				key = key.substring(1);
				int i = key.indexOf('.');
				if (i < 1) {
					throw new IllegalArgumentException(
							"Invalid resource key \"" + key + "\".");
				}
				String dataTypeName = key.substring(0, i);
				String subKey = key.substring(i + 1);

				Properties subProperties = null;
				if (subPropertiesMap == null) {
					subPropertiesMap = new HashMap<String, Properties>();
				} else {
					subProperties = subPropertiesMap.get(dataTypeName);
				}

				if (subProperties == null) {
					subProperties = new Properties();
					subPropertiesMap.put(dataTypeName, subProperties);
				}
				subProperties.setProperty(subKey, value);
			}
		}
	}

	public Properties getSubProperties(String dataTypeName) {
		return (subPropertiesMap == null) ? null : subPropertiesMap
				.get(dataTypeName);
	}

}
