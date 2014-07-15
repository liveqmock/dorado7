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

package com.bstek.dorado.data.entity;

import java.util.Collection;
import java.util.Set;

import com.bstek.dorado.data.type.AggregationDataType;

/**
 * {@link java.util.Set}型返回结果的代理。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apirl 15, 2007
 */
public class EntitySet<E> extends EntityCollection<E> implements Set<E> {

	/**
	 * @param target
	 *            被代理的{@link java.util.Set}对象
	 * @param dataType
	 *            相应的数据类型
	 * @throws Exception
	 */
	public EntitySet(Set<E> target, AggregationDataType dataType)
			throws Exception {
		super(target, dataType);
	}

	@Override
	@SuppressWarnings("unchecked")
	protected void replaceAllElementWithProxyIfNecessary(
			Collection<? extends E> collection) {
		Set<E> target = (Set<E>) collection;
		Object[] elements = target.toArray();
		target.clear();
		for (Object o : elements) {
			target.add(proxyElementIfNecessary((E) o));
		}
	}

}
