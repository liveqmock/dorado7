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

package com.bstek.dorado.view.type.property;

import java.lang.reflect.Array;
import java.util.Collection;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.data.entity.EntityWrapper;
import com.bstek.dorado.data.type.property.Mapping;
import com.bstek.dorado.view.output.DataOutputter;
import com.bstek.dorado.view.output.JsonBuilder;
import com.bstek.dorado.view.output.OutputContext;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-4-13
 */
public class MappingPropertyOutputter extends DataOutputter {
	@Override
	@SuppressWarnings("rawtypes")
	public boolean isEscapeValue(Object value) {
		boolean shouldEscape = (value == null);
		if (!shouldEscape) {
			Mapping mapping = (Mapping) value;
			Object mapValues = mapping.getMapValues();
			shouldEscape = (mapValues == null);
			if (!shouldEscape) {
				if (mapValues instanceof Collection) {
					shouldEscape = ((Collection) mapValues).isEmpty();
				} else if (mapValues.getClass().isArray()) {
					shouldEscape = (Array.getLength(mapValues) == 0);
				}
			}
		}
		return shouldEscape;
	}

	@Override
	@SuppressWarnings("rawtypes")
	public void output(Object value, OutputContext context) throws Exception {
		Mapping mapping = (Mapping) value;
		Object mapValues = mapping.getMapValues();
		if (mapValues instanceof Collection) {
			outputCollection(mapping, (Collection) mapValues, context);
		} else if (mapValues.getClass().isArray()) {
			outputArray(mapping, mapValues, context);
		} else if (mapValues instanceof Map) {
			outputMap((Map) mapValues, context);
		} else {
			JsonBuilder json = context.getJsonBuilder();
			json.value(null);
		}
	}

	@SuppressWarnings("rawtypes")
	protected void outputCollection(Mapping mapping, Collection mapValues,
			OutputContext context) throws Exception {
		String keyProperty = StringUtils.defaultString(
				mapping.getKeyProperty(), "key");
		String valueProperty = StringUtils.defaultString(
				mapping.getValueProperty(), "value");

		JsonBuilder json = context.getJsonBuilder();
		json.array();

		for (Object element : mapValues) {
			EntityWrapper entity = EntityWrapper.create(element);
			json.object();

			json.key("key");
			outputData(entity.get(keyProperty), context);
			json.endKey();

			json.key("value");
			outputData(entity.get(valueProperty), context);
			json.endKey();

			json.endObject();
		}
		json.endArray();
	}

	protected void outputArray(Mapping mapping, Object elements,
			OutputContext context) throws Exception {
		String keyProperty = StringUtils.defaultString(
				mapping.getKeyProperty(), "key");
		String valueProperty = StringUtils.defaultString(
				mapping.getValueProperty(), "value");

		JsonBuilder json = context.getJsonBuilder();
		json.array();

		int length = Array.getLength(elements);
		for (int i = 0; i < length; i++) {
			Object element = Array.get(elements, i);
			EntityWrapper entity = EntityWrapper.create(element);
			json.object();

			json.key("key");
			outputData(entity.get(keyProperty), context);
			json.endKey();

			json.key("value");
			outputData(entity.get(valueProperty), context);
			json.endKey();

			json.endObject();
		}
		json.endArray();
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	protected void outputMap(Map mapValues, OutputContext context)
			throws Exception {
		JsonBuilder json = context.getJsonBuilder();
		json.array();
		for (Map.Entry entry : (Set<Map.Entry>) mapValues.entrySet()) {
			json.object();

			json.key("key");
			outputData(entry.getKey(), context);
			json.endKey();

			json.key("value");
			outputData(entry.getValue(), context);
			json.endKey();

			json.endObject();
		}
		json.endArray();
	}
}
