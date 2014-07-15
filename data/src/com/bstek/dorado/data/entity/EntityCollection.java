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
import java.util.Iterator;

import com.bstek.dorado.data.type.AggregationDataType;
import com.bstek.dorado.data.type.DataType;

/**
 * 抽象的集合类代理。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apirl 15, 2007
 */
public abstract class EntityCollection<E> implements Collection<E> {
	private Collection<E> target;

	/**
	 * 集合的数据类型。
	 */
	private AggregationDataType dataType;

	/**
	 * 集合元素的数据类型。
	 */
	private DataType elementDataType;

	private boolean elementsReplaced = false;

	/**
	 * @param target
	 *            被代理的集合类。
	 * @param dataType
	 *            集合的数据类型。
	 */
	public EntityCollection(Collection<E> target, AggregationDataType dataType) {
		this.target = target;
		setDataType(dataType);
	}

	public void setDataType(AggregationDataType dataType) {
		if (this.dataType != dataType) {
			this.dataType = dataType;
			this.elementDataType = (dataType == null) ? null : dataType
					.getElementDataType();
			elementsReplaced = false;
		}
	}

	/**
	 * 返回集合的数据类型。
	 */
	public AggregationDataType getDataType() {
		return dataType;
	}

	/**
	 * 返回集合元素的数据类型。
	 */
	public DataType getElementType() {
		return elementDataType;
	}

	/**
	 * 判断是否需要为传入的对象创建动态代理，如果需要将返回新创建的动态代理，否则将直接返回对象自身。
	 * 
	 * @param element
	 *            Object 可能需要代理的对象
	 * @return 动态代理或对象本身
	 */
	@SuppressWarnings("unchecked")
	protected E proxyElementIfNecessary(E element) {
		try {
			return (E) EntityUtils.toEntity(element, elementDataType);
		} catch (Exception e) {
			throw new IllegalStateException(e);
		}
	}

	protected void replaceAllElementIfNecessary() {
		if (!elementsReplaced) {
			replaceAllElementWithProxyIfNecessary(target);
			elementsReplaced = true;
		}
	}

	/**
	 * 判断集合中的每一个对象是否需要动态代理，如果需要将该集合元素替换为新创建的动态代理。
	 */
	protected abstract void replaceAllElementWithProxyIfNecessary(
			Collection<? extends E> collection);

	/**
	 * 返回被代理的集合类。
	 */
	public Collection<E> getTarget() {
		replaceAllElementIfNecessary();
		return target;
	}

	public boolean add(E o) {
		replaceAllElementIfNecessary();
		o = proxyElementIfNecessary(o);
		return target.add(o);
	}

	public boolean addAll(Collection<? extends E> c) {
		replaceAllElementIfNecessary();
		boolean b = false;
		for (E o : c) {
			target.add(proxyElementIfNecessary(o));
			b = true;
		}
		return b;
	}

	public void clear() {
		target.clear();
	}

	public boolean contains(Object o) {
		replaceAllElementIfNecessary();
		return target.contains(o);
	}

	public boolean containsAll(Collection<?> c) {
		replaceAllElementIfNecessary();
		return target.containsAll(c);
	}

	@Override
	public boolean equals(Object o) {
		return target.equals(o);
	}

	@Override
	public int hashCode() {
		return target.hashCode();
	}

	public boolean isEmpty() {
		return target.isEmpty();
	}

	public Iterator<E> iterator() {
		replaceAllElementIfNecessary();
		return target.iterator();
	}

	public boolean remove(Object o) {
		replaceAllElementIfNecessary();
		return target.remove(o);
	}

	public boolean removeAll(Collection<?> c) {
		replaceAllElementIfNecessary();
		return target.removeAll(c);
	}

	public boolean retainAll(Collection<?> c) {
		replaceAllElementIfNecessary();
		return target.retainAll(c);
	}

	public int size() {
		return target.size();
	}

	public Object[] toArray() {
		replaceAllElementIfNecessary();
		return target.toArray();
	}

	public <T> T[] toArray(T[] a) {
		replaceAllElementIfNecessary();
		return target.toArray(a);
	}

}
