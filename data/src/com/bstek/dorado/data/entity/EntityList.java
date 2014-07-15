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
import java.util.List;
import java.util.ListIterator;

import com.bstek.dorado.data.type.AggregationDataType;

/**
 * {@link java.util.List}型返回结果的代理。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apirl 15, 2007
 */
public class EntityList<E> extends EntityCollection<E> implements List<E> {

	private List<E> listTarget;

	/**
	 * @param target
	 *            被代理的{@link java.util.List}对象
	 * @param dataType
	 *            相应的数据类型
	 * @throws Exception
	 */
	public EntityList(List<E> target, AggregationDataType dataType)
			throws Exception {
		super(target, dataType);
		listTarget = (List<E>) getTarget();
	}

	@Override
	@SuppressWarnings("unchecked")
	protected void replaceAllElementWithProxyIfNecessary(
			Collection<? extends E> collection) {
		List<E> target = (List<E>) collection;
		int size = target.size();
		for (int i = 0; i < size; i++) {
			target.set(i, proxyElementIfNecessary(target.get(i)));
		}
	}

	public boolean addAll(int index, Collection<? extends E> c) {
		boolean b = false;
		for (E o : c) {
			listTarget.add(proxyElementIfNecessary(o));
			b = true;
		}
		return b;
	}

	public E get(int index) {
		replaceAllElementIfNecessary();
		return listTarget.get(index);
	}

	public E set(int index, E element) {
		replaceAllElementIfNecessary();
		return listTarget.set(index, proxyElementIfNecessary(element));
	}

	public void add(int index, E element) {
		replaceAllElementIfNecessary();
		listTarget.add(index, proxyElementIfNecessary(element));
	}

	public E remove(int index) {
		return proxyElementIfNecessary(listTarget.remove(index));
	}

	public int indexOf(Object o) {
		replaceAllElementIfNecessary();
		return listTarget.indexOf(o);
	}

	public int lastIndexOf(Object o) {
		replaceAllElementIfNecessary();
		return listTarget.lastIndexOf(o);
	}

	public ListIterator<E> listIterator() {
		replaceAllElementIfNecessary();
		return listTarget.listIterator();
	}

	public ListIterator<E> listIterator(int index) {
		replaceAllElementIfNecessary();
		return listTarget.listIterator(index);
	}

	public List<E> subList(int fromIndex, int toIndex) {
		replaceAllElementIfNecessary();
		return listTarget.subList(fromIndex, toIndex);
	}
}
