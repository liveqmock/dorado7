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

import java.util.Iterator;

/**
 * {@link java.util.Iterator}代理的抽象支持类。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 28, 2007
 */
public abstract class IteratorProxySupport<E> implements Iterator<E> {
	private Iterator<E> target;

	/**
	 * @param target 被代理{@link java.util.Iterator}对象。
	 */
	public IteratorProxySupport(Iterator<E> target) {
		this.target = target;
	}

	/**
	 * 返回被代理的{@link java.util.Iterator}对象。
	 */
	public Iterator<E> getTarget() {
		return target;
	}

	public boolean hasNext() {
		return target.hasNext();
	}

	public E next() {
		return target.next();
	}

	public void remove() {
		target.remove();
	}
}
