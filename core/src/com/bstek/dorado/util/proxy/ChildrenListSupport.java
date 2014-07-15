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

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * 用于辅助实现子对象管理功能的抽象List。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jan 2, 2008
 */
public abstract class ChildrenListSupport<E> extends ListProxySupport<E> {
	private static final long serialVersionUID = 4563965086060066431L;

	public ChildrenListSupport() {
		super(new ArrayList<E>());
	}

	/**
	 * @param target
	 *            被代理的List。
	 */
	public ChildrenListSupport(List<E> target) {
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
	public void add(int index, E o) {
		super.add(index, o);
		childAdded(o);
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
	public boolean addAll(int index, Collection<? extends E> c) {
		boolean retval = super.addAll(index, c);
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
	public E remove(int index) {
		E o = super.remove(index);
		if (o != null)
			childRemoved(o);
		return o;
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
