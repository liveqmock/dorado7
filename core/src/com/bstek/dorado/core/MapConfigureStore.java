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

import java.util.HashSet;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-12-31
 */
public class MapConfigureStore extends ConfigureStore {
	@SuppressWarnings("rawtypes")
	private Map map;

	public MapConfigureStore(Map<String, Object> map) {
		this.map = map;
	}

	public MapConfigureStore(Properties properties) {
		this.map = properties;
	}

	@Override
	public boolean contains(String key) {
		return map.containsKey(key);
	}

	@Override
	public Object get(String key) {
		return map.get(key);
	}

	@Override
	public void remove(String key) {
		map.remove(key);
	}

	@SuppressWarnings("unchecked")
	@Override
	protected void doSet(String key, Object value) {
		if (value != null) {
			map.put(key, value);
		} else {
			map.remove(key);
		}
	}

	@Override
	public Set<String> keySet() {
		Set<String> keys = new HashSet<String>();
		for (Object key : map.keySet()) {
			keys.add(String.valueOf(key));
		}
		return keys;
	}
};
