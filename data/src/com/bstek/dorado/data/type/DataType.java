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

import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.common.TagSupport;
import com.bstek.dorado.data.DataModelObject;

/**
 * 数据类型。
 * <p>
 * DataType是对所有系统中可能使用到的数据类型的抽象。这其中既包含了Java中的简单数据类型， 也可能包含用户自定义的各种POJO类型。
 * </p>
 * <p>
 * DataType从功能上可分为两个大类： AggregationDataType（聚合类型）和NonAggregationDataType（非聚合类型）。
 * java.util.List、java.util.Set、java.util.Iterator、java.util.Enumeration的实现类
 * 以及java.lang.Array均属于聚合类型，其它类型大都属于非聚合类型。
 * </p>
 * <p>
 * 其中非聚合类型又可以分为SimpleDataType（简单类型）和AttributeSetDataType（属性集类型）两个大类。
 * 属性集类型一般包含java.util.Map、java.util.Properties、Bean这几种，他们的共同点是具有属性或键值的概念。
 * </p>
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 12, 2007
 */
@ClientEvents(@com.bstek.dorado.annotation.ClientEvent(name = "onAttributeChange"))
public interface DataType extends DataModelObject, TagSupport {
	/**
	 * 返回DataType的名称。
	 * 
	 * @return DataType的名称。
	 */
	String getName();

	/**
	 * 返回该DataType相匹配的Java类型。<br>
	 * dataTypeRegistry将根据此属性的返回值确定应该使用何种DataType来描述某个Java数据类型。
	 * 
	 * @return 相关的Class类型
	 */
	Class<?> getMatchType();

	/**
	 * 返回该DataType相匹配的可实例化Java类型。<br>
	 * 即当我们需要根据该DataType来创建一个新的数据对象时，应该实例化那种类型。
	 * 默认情况下DataType会直接以matchType属性中的类型作为creationType。
	 * 但在部分情况下，matchType定义的类型是不可实例化的，此时我们需要为DataType设置creationType。
	 * creationType应该总是matchType的子类型。
	 * 
	 * @return 可实例化Java数据类型。
	 */
	Class<?> getCreationType();

	/**
	 * 将一个文本型的值转换成本DataType所描述的类型。
	 * 
	 * @param text
	 *            文本型的值。
	 * @return 数据对象。
	 */
	Object fromText(String text);

	/**
	 * 尝试将一个任意类型的值转换成本DataType所描述的类型。<br>
	 * 如果传入的数据无法被转换将抛出{@link com.bstek.dorado.data.type.DataConvertException}异常。
	 * 
	 * @param value
	 *            要转换的数据。
	 * @return 转换后得到的数据。
	 */
	Object fromObject(Object value);

	/**
	 * 将一个数据对象转换成文本型的值。
	 * 
	 * @param value
	 *            数据对象。
	 * @return 文本型的值。
	 */
	String toText(Object value);
}
