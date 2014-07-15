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

package com.bstek.dorado.util;

import java.lang.reflect.Method;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 支持深度克隆的LinkedHashMap。
 * <p>
 * 深度克隆是指在克隆Map时同时克隆Map中引用的每一个值对象，新的Map将会引用这些克隆后得到的新的值对象。 <br>
 * 需要注意的是，如果原Map中引用的某个值对象不支持Cloneable接口，那么在执行克隆时将跳过对该值对象的克隆， 新的Map将直接引用原先的值对象。
 * </p>
 * <p>
 * DeepCloneableLinkedHashMap继承自{@link java.util.LinkedHashMap}，所以在进行键值的迭代时，
 * 键值的迭代顺序将与之前键值被put到Map中的先后顺序保持一致。
 * </p>
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 21 Feb 2007
 * @see java.lang.Cloneable
 * @see java.util.LinkedHashMap
 */
public class DeepCloneableLinkedHashMap<K, V> extends LinkedHashMap<K, V>
		implements Cloneable {
	private static final long serialVersionUID = 7068794769959760568L;

	private static final String CLONE_METHOD = "clone";
	private static final Class<?>[] CLONE_PARAM_CLASSES = new Class<?>[] {};
	private static final Object[] CLONE_PARAM_OBJECTS = new Object[] {};

	/**
	 * 深度克隆此Map对象
	 * @return 克隆后得到的新Map
	 */
	@Override
	@SuppressWarnings("unchecked")
	public Object clone() {
		Map<K, V> map = (Map<K, V>) super.clone();
		for (Map.Entry<K, V> entry : map.entrySet()) {
			Object value = entry.getValue();
			if (value != null && value instanceof Cloneable) {
				try {
					Method method = value.getClass().getMethod(CLONE_METHOD,
							CLONE_PARAM_CLASSES);
					if (method != null) {
						entry.setValue((V) method.invoke(value,
								CLONE_PARAM_OBJECTS));
					}
				}
				catch (Exception ex) {
					// do nothing
				}
			}
		}
		return map;
	}

}
