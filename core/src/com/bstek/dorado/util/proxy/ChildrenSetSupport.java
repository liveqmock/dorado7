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

/**
 *
 */
package com.bstek.dorado.util.proxy;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

/**
 * 用于辅助实现子对象管理功能的抽象Set。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Dec 30, 2007
 */
public abstract class ChildrenSetSupport<E> extends SetProxySupport<E> {
	private static final long serialVersionUID = 2739659901414574963L;

	public ChildrenSetSupport() {
		super(new HashSet<E>());
	}

	/**
	 * @param target
	 *            被代理的Set。
	 */
	public ChildrenSetSupport(Set<E> target) {
		super(target);
	}

	/**
	 * 当有新的子对象被添加到Set时被激活的方法。
	 * 
	 * @param child
	 *            子对象
	 */
	protected abstract void childAdded(E child);

	/**
	 * 当有新的子对象被添加到Set时被激活的方法。
	 * 
	 * @param child
	 *            子对象
	 */
	protected abstract void childRemoved(E child);

	@Override
	public boolean add(E o) {
		boolean retval = super.add(o);
		if (retval)
			childAdded(o);
		return retval;
	}

	@Override
	public boolean addAll(Collection<? extends E> c) {
		boolean retval = super.addAll(c);
		if (retval) {
			for (E o : c) {
				childAdded(o);
			}
		}
		return retval;
	}

	@Override
	public void clear() {
		for (E o : this) {
			childRemoved(o);
		}
		super.clear();
	}

	@Override
	@SuppressWarnings("unchecked")
	public boolean remove(Object o) {
		boolean retval = super.remove(o);
		if (retval)
			childRemoved((E) o);
		return retval;
	}

	@Override
	public boolean removeAll(Collection<?> c) {
		boolean retval = false;
		for (Object o : c) {
			if (contains(o)) {
				remove(o);
				retval = true;
			}
		}
		return retval;
	}

}
