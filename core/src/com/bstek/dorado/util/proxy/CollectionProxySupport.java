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

package com.bstek.dorado.util.proxy;

import java.io.ObjectStreamException;
import java.io.Serializable;
import java.util.Collection;
import java.util.Iterator;

/**
 * {@link java.util.Collection}代理的抽象支持类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apirl 15, 2007
 */
public abstract class CollectionProxySupport<E> implements Collection<E>,
		Serializable {
	private static final long serialVersionUID = -6529194580197068453L;

	private Collection<E> target;

	/**
	 * @param target
	 *            被代理的{@link java.util.Collection}对象。
	 */
	public CollectionProxySupport(Collection<E> target) {
		setTarget(target);
	}

	/**
	 * 设置被代理的{@link java.util.Collection}对象。
	 */
	protected void setTarget(Collection<E> target) {
		this.target = target;
	}

	/**
	 * 返回被代理的{@link java.util.Collection}对象。
	 */
	public Collection<E> getTarget() {
		return target;
	}

	public boolean add(E o) {
		return target.add(o);
	}

	public boolean addAll(Collection<? extends E> c) {
		return target.addAll(c);
	}

	public void clear() {
		target.clear();
	}

	public boolean contains(Object o) {
		return target.contains(o);
	}

	public boolean containsAll(Collection<?> c) {
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
		return target.iterator();
	}

	public boolean remove(Object o) {
		return target.remove(o);
	}

	public boolean removeAll(Collection<?> c) {
		return target.removeAll(c);
	}

	public boolean retainAll(Collection<?> c) {
		return target.retainAll(c);
	}

	public int size() {
		return target.size();
	}

	public Object[] toArray() {
		return target.toArray();
	}

	public <T> T[] toArray(T[] a) {
		return target.toArray(a);
	}

	public Object writeReplace() throws ObjectStreamException {
		return target;
	}

}
