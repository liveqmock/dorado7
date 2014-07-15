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

package com.bstek.dorado.data.type;

import java.lang.reflect.Array;
import java.lang.reflect.Modifier;
import java.util.Collection;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.XmlProperty;

/**
 * 聚合类型。
 * <p>
 * 聚合类型主要包括java.util.List、java.util.Set、java.util.Iterator、java.util.
 * Enumeration的实现类 以及java.lang.Array的派生类型。
 * </p>
 * <p>
 * 聚合类型通过elementDataType属性来指定被聚合对象的DataType。
 * 例如一个存放String的数组，其被聚合对象的DataType即是StringDataType。
 * </p>
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 13, 2007
 */
@ClientObject(prototype = "dorado.AggregationDataType", shortTypeName = "Aggregation")
public class AggregationDataType extends AbstractDataType implements
		MutableDataType {
	private DataType elementDataType;

	@Override
	@SuppressWarnings({ "unchecked", "rawtypes" })
	public Object fromObject(Object value) {
		if (value == null) {
			return null;
		}

		Class<?> targetType = this.getMatchType();
		if (targetType != null && targetType.isAssignableFrom(value.getClass())) {
			return value;
		}

		if (Collection.class.isAssignableFrom(targetType)) {
			Collection collection = null;
			Class<?> creationType = getCreationType();
			if (creationType == null) {
				creationType = targetType;
			}
			if (creationType != null
					&& Collection.class.isAssignableFrom(creationType)
					&& !Modifier.isAbstract(creationType.getModifiers())) {
				try {
					collection = (Collection) creationType.newInstance();
				} catch (Exception e) {
					throw new DataConvertException(value.getClass(),
							getMatchType(), e);
				}

				if (value instanceof Collection) {
					collection.addAll((Collection) value);
				} else if (value.getClass().isArray()) {
					int len = Array.getLength(value);
					for (int i = 0; i < len; i++) {
						collection.add(Array.get(value, i));
					}
				}
				return collection;
			}
		}
		throw new DataConvertException(value.getClass(), getMatchType());
	}

	public Object fromText(String text) {
		if (text == null) {
			return null;
		}
		throw new DataConvertException(String.class, getMatchType());
	}

	/**
	 * 返回聚合元素的DataType。
	 * <p>
	 * 例如：对于java.util.Vector，聚合元素就是Vector中管理的各个元素。
	 * </p>
	 */
	@XmlProperty(ignored = true)
	@ClientProperty
	public DataType getElementDataType() {
		return elementDataType;
	}

	/**
	 * 设置聚合元素的DataType。
	 * <p>
	 * 例如：对于java.util.Vector，聚合元素就是Vector中管理的各个元素。
	 * </p>
	 */
	public void setElementDataType(DataType elementDataType) {
		this.elementDataType = elementDataType;
	}

}
