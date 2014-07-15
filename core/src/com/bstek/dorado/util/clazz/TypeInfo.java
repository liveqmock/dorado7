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

package com.bstek.dorado.util.clazz;

import java.lang.reflect.ParameterizedType;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.lang.StringUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-12-7
 */
public class TypeInfo {
	private static Pattern AGGREGATION_PATTERN_1 = Pattern
			.compile("^([\\w|.]*)\\<([\\w|.]+)\\>$");
	private static Pattern AGGREGATION_PATTERN_2 = Pattern
			.compile("^([\\w|.]*)\\[\\]$");

	private Class<?> type;
	private boolean aggregated;

	public static TypeInfo parse(String className)
			throws ClassNotFoundException {
		if (StringUtils.isEmpty(className)) {
			return null;
		}

		String typeName = null;
		boolean aggregated = false;
		Matcher matcher = AGGREGATION_PATTERN_1.matcher(className);
		if (matcher.matches()) {
			typeName = matcher.group(2);
			aggregated = true;
		} else {
			matcher = AGGREGATION_PATTERN_2.matcher(className);
			if (matcher.matches()) {
				typeName = matcher.group(1);
				aggregated = true;
			}
		}
		if (typeName == null) {
			typeName = className;
		}

		return new TypeInfo(ClassUtils.forName(typeName), aggregated);
	}

	public static TypeInfo parse(ParameterizedType type, boolean aggregated)
			throws ClassNotFoundException {
		Class<?> classType;
		try {
			classType = (Class<?>) type.getActualTypeArguments()[0];
		} catch (Exception e) {
			classType = Object.class;
		}
		return new TypeInfo(classType, aggregated);
	}

	public TypeInfo(Class<?> type, boolean aggregated) {
		this.type = type;
		this.aggregated = aggregated;
	}

	public Class<?> getType() {
		return type;
	}

	public boolean isAggregated() {
		return aggregated;
	}
}
