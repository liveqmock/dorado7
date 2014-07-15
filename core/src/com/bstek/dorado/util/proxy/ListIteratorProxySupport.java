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

import java.util.ListIterator;

/**
 * {@link java.util.ListIterator}代理的抽象支持类。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 18 Apirl 2007
 */
public abstract class ListIteratorProxySupport<E> implements ListIterator<E> {

	private ListIterator<E> target;

	/**
	 * @param target 被代理{@link java.util.ListIterator}对象。
	 */
	public ListIteratorProxySupport(ListIterator<E> target) {
		this.target = target;
	}

	/**
	 * 返回被代理的{@link java.util.ListIterator}对象。
	 */
	public ListIterator<E> getTarget() {
		return target;
	}

	public void add(E o) {
		target.add(o);
	}

	public boolean hasNext() {
		return target.hasNext();
	}

	public boolean hasPrevious() {
		return target.hasPrevious();
	}

	public E next() {
		return target.next();
	}

	public int nextIndex() {
		return target.nextIndex();
	}

	public E previous() {
		return target.previous();
	}

	public int previousIndex() {
		return target.previousIndex();
	}

	public void remove() {
		target.remove();
	}

	public void set(E o) {
		target.set(o);
	}
}
