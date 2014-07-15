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

package com.bstek.dorado.data.listener;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-7-10
 */
public abstract class GenericObjectListener<T> {
	private int order = 999;
	private String pattern;
	private String excludePattern;

	@SuppressWarnings("rawtypes")
	Class resultType = void.class;

	public int getOrder() {
		return order;
	}

	public void setOrder(int order) {
		this.order = order;
	}

	public String getPattern() {
		return pattern;
	}

	public void setPattern(String pattern) {
		this.pattern = pattern;
	}

	public String getExcludePattern() {
		return excludePattern;
	}

	public void setExcludePattern(String excludePattern) {
		this.excludePattern = excludePattern;
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public Class<T> getParameterizedType() {
		if (resultType == void.class) {
			Class cl = getClass();
			Type superType = cl.getGenericSuperclass();

			if (superType instanceof ParameterizedType) {
				Type[] paramTypes = ((ParameterizedType) superType)
						.getActualTypeArguments();
				if (paramTypes.length > 0) {
					resultType = (Class<T>) paramTypes[0];
				}
			}
		}
		return resultType;
	}

	public abstract boolean beforeInit(T object) throws Exception;

	public abstract void onInit(T object) throws Exception;
}
