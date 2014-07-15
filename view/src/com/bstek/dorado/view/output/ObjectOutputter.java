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

package com.bstek.dorado.view.output;

import java.io.IOException;
import java.io.Writer;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import net.sf.cglib.beans.BeanMap;

import com.bstek.dorado.annotation.EscapeMode;
import com.bstek.dorado.common.Ignorable;
import com.bstek.dorado.data.entity.EntityUtils;
import com.bstek.dorado.view.el.OutputableExpressionUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-12-24
 */
public class ObjectOutputter implements Outputter {
	private EscapeMode escapeMode = EscapeMode.AUTO;
	private Map<String, PropertyConfig> propertieConfigs = new HashMap<String, PropertyConfig>();

	public EscapeMode getEscapeMode() {
		return escapeMode;
	}

	public void setEscapeMode(EscapeMode escapeMode) {
		this.escapeMode = escapeMode;
	}

	/**
	 * 返回要输出的POJO属性的Map集合。
	 */
	public Map<String, PropertyConfig> getPropertieConfigs() {
		return propertieConfigs;
	}

	/**
	 * 设置要输出的POJO属性的Map集合。<br>
	 * 其中Map集合的键为属性名，不同类型的键值具有不同的含义：
	 * <ul>
	 * <li>通常情况下键值会被默认为是相应属性的默认值。 即当某个要输出的POJO属性值与默认值相同时，该属性将被忽略而不会输出到JSON中。</li>
	 * <li>当键值是PropertyOutputter的实现类时，键值代表一个子属性的输出器。 此时系统会将该属性的输出任务分派给这个子输出器。</li>
	 * <li>当键值是VirtualPropertyOutputter的实现类时，键值代表一个虚拟属性的输出器。
	 * 虚拟属性是指并不一定真的存在于要输出的Java对象中的属性，只是我们希望在进行输出时输出这样一个属性值。</li>
	 * <li>字符串"#default"是一个特殊的默认值，并且对于不同数据类型的属性而言"#default"又代表不同含义：
	 * <ul>
	 * <li>对String而言"#default"表示null或""。</li>
	 * <li>对boolean而言"#default"表示false。</li>
	 * <li>对int、long、float、double等而言"#default"表示0。</li>
	 * <li>对其他数据类型而言"#default"表示null。</li>
	 * </ul>
	 * </li>
	 * <li>字符串"#ignore"是一个特殊的值，表示忽略该属性的输出操作。</li>
	 * </ul>
	 */
	public void setPropertieConfigs(Map<String, PropertyConfig> propertieConfigs) {
		this.propertieConfigs = propertieConfigs;
	}

	protected boolean isEscapeable(OutputContext context) {
		if (EscapeMode.YES.equals(escapeMode)) {
			return true;
		} else if (EscapeMode.YES.equals(escapeMode)) {
			return false;
		} else {
			return context.isEscapeable();
		}
	}

	public void output(Object object, OutputContext context) throws Exception {
		if (object != null) {
			JsonBuilder json = context.getJsonBuilder();
			if (object instanceof Collection<?>) {
				if (isEscapeable(context)) {
					json.escapeableArray();
				} else {
					json.array();
				}
				for (Object element : (Collection<?>) object) {
					if (element instanceof Ignorable
							&& ((Ignorable) element).isIgnored()) {
						continue;
					}
					outputObject(element, context);
				}
				json.endArray();
			} else {
				outputObject(object, context);
			}
		} else {
			if (!isEscapeable(context)) {
				context.getWriter().append("null");
			}
		}
	}

	/**
	 * 将一个Java的POJO对象输出成为JSON对象。
	 */
	protected void outputObject(Object object, OutputContext context)
			throws IOException, Exception {
		Writer writer = context.getWriter();
		if (object != null) {
			JsonBuilder json = context.getJsonBuilder();
			if (isEscapeable(context)) {
				json.escapeableObject();
			} else {
				json.object();
			}
			outputObjectProperties(object, context);
			json.endObject();
		} else {
			writer.append("null");
		}
	}

	/**
	 * 输出一个Java的POJO对象中在{@link #getConfigProperties()}配置过的各个POJO属性。
	 */
	@SuppressWarnings({ "unchecked", "rawtypes" })
	protected void outputObjectProperties(Object object, OutputContext context)
			throws Exception {
		Map beanMap;
		if (object instanceof Map) {
			beanMap = (Map) object;
		} else if (object.getClass() == Object.class) {
			beanMap = Collections.EMPTY_MAP;
		} else {
			beanMap = BeanMap.create(object);
		}

		Map<String, PropertyConfig> propertiesConfigs = getPropertieConfigs();
		PropertyConfig defaultPropertyConfig = propertiesConfigs.get("*");
		PropertyOutputter defaultPropertyOutputter = null;
		if (defaultPropertyConfig != null && !defaultPropertyConfig.isIgnored()) {
			defaultPropertyOutputter = (PropertyOutputter) defaultPropertyConfig
					.getOutputter();
		}

		JsonBuilder json = context.getJsonBuilder();
		for (String property : ((Map<String, ?>) beanMap).keySet()) {
			if ("class".equals(property)) {
				continue;
			}

			PropertyConfig propertyConfig = propertiesConfigs.get(property);
			if (propertyConfig != null) {
				if (propertyConfig.isIgnored()) {
					continue;
				}

				Object outputter = propertyConfig.getOutputter();
				if (outputter != null
						&& outputter instanceof VirtualPropertyOutputter) {
					continue;
				}

				if (!propertyConfig.isEvaluateExpression()) {
					OutputableExpressionUtils.disableOutputableExpression();
				}
				Object value = null;
				try {
					value = beanMap.get(property);
					if (OutputableExpressionUtils.getSkipedExpression() != null) {
						value = OutputableExpressionUtils.getSkipedExpression();
					}
				} finally {
					if (!propertyConfig.isEvaluateExpression()) {
						OutputableExpressionUtils.enableOutputableExpression();
					}
				}

				Object escapeValue = propertyConfig.getEscapeValue();
				boolean hasEscapeValue = (PropertyConfig.NONE_VALUE != escapeValue);
				if (hasEscapeValue) {
					if (OutputUtils.isEscapeValue(value, escapeValue)) {
						continue;
					}
				}

				PropertyOutputter propertyOutputter = (PropertyOutputter) outputter;
				if (propertyOutputter == null) {
					propertyOutputter = defaultPropertyOutputter;
				}
				if (propertyOutputter != null
						&& (hasEscapeValue || !propertyOutputter
								.isEscapeValue(value))) {
					json.escapeableKey(property);
					propertyOutputter.output(value, context);
					json.endKey();
				}
			} else {
				Object value = beanMap.get(property);
				if (defaultPropertyOutputter != null && value != null
						&& EntityUtils.isSimpleValue(value)
						&& !defaultPropertyOutputter.isEscapeValue(value)) {
					json.escapeableKey(property);
					defaultPropertyOutputter.output(value, context);
					json.endKey();
				}
			}
		}

		for (Map.Entry<String, PropertyConfig> entry : propertiesConfigs
				.entrySet()) {
			Object propertyOutputter = entry.getValue().getOutputter();
			if (propertyOutputter != null
					&& propertyOutputter instanceof VirtualPropertyOutputter) {
				String property = entry.getKey();
				((VirtualPropertyOutputter) propertyOutputter).output(object,
						property, context);
			}
		}
	}
}
