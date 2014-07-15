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

import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.WeakHashMap;

/**
 * 弱引用HashSet。
 * <p>
 * WeakHashSet的作用类似与{@link java.util.WeakHashMap}，它不会阻止被引用的对象被GC回收。
 * 并且WeakHashSet会自动的剔除掉那些已被GC回收的引用，因此WeakHashSet是会自动收缩的。
 * </p>
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 19, 2007
 * @see java.util.WeakHashMap
 */
public class WeakHashSet<E> implements Set<E> {
	private static final Object PRESENT = new Object();

	private Map<E, Object> map = new WeakHashMap<E, Object>();

	/**
	 * Returns the number of elements in this set (its cardinality).
	 * @return the number of elements in this set (its cardinality).
	 */
	public int size() {
		return map.size();
	}

	/**
	 * Removes all of the elements from this set (optional operation).
	 */
	public void clear() {
		map.clear();
	}

	/**
	 * Returns <tt>true</tt> if this set contains no elements.
	 * @return <tt>true</tt> if this set contains no elements.
	 */
	public boolean isEmpty() {
		return map.isEmpty();
	}

	/**
	 * Adds the specified element to this set if it is not already present
	 * (optional operation).
	 * @param o element to be added to this set.
	 * @return <tt>true</tt> if this set did not already contain the specified
	 *         element.
	 */
	public synchronized boolean add(E o) {
		return map.put(o, PRESENT) == null;
	}

	/**
	 * Returns <tt>true</tt> if this set contains the specified element.
	 * @param o element whose presence in this set is to be tested.
	 * @return <tt>true</tt> if this set contains the specified element.
	 */
	public boolean contains(Object o) {
		return map.containsKey(o);
	}

	/**
	 * Removes the specified element from this set if it is present (optional
	 * operation).
	 * @param o object to be removed from this set, if present.
	 * @return true if the set contained the specified element.
	 */
	public synchronized boolean remove(Object o) {
		return map.remove(o) != PRESENT;
	}

	/**
	 * Adds all of the elements in the specified collection to this set if
	 * they're not already present (optional operation).
	 * @param c collection whose elements are to be added to this set.
	 * @return <tt>true</tt> if this set changed as a result of the call.
	 */
	public synchronized boolean addAll(Collection<? extends E> c) {
		boolean modified = false;
		Iterator<? extends E> e = c.iterator();
		while (e.hasNext()) {
			if (add(e.next())) modified = true;
		}
		return modified;
	}

	/**
	 * Returns <tt>true</tt> if this set contains all of the elements of the
	 * specified collection.
	 * @param c collection to be checked for containment in this set.
	 * @return <tt>true</tt> if this set contains all of the elements of the
	 *         specified collection.
	 */
	public synchronized boolean containsAll(Collection<?> c) {
		Iterator<?> e = c.iterator();
		while (e.hasNext())
			if (!contains(e.next())) return false;
		return true;
	}

	/**
	 * Removes from this set all of its elements that are contained in the
	 * specified collection (optional operation).
	 * @param c collection that defines which elements will be removed from this
	 *            set.
	 * @return <tt>true</tt> if this set changed as a result of the call.
	 */
	public synchronized boolean removeAll(Collection<?> c) {
		boolean modified = false;
		Iterator<?> e = iterator();
		while (e.hasNext()) {
			if (c.contains(e.next())) {
				e.remove();
				modified = true;
			}
		}
		return modified;
	}

	/**
	 * Retains only the elements in this set that are contained in the specified
	 * collection (optional operation).
	 * @param c collection that defines which elements this set will retain.
	 * @return <tt>true</tt> if this collection changed as a result of the call.
	 */
	public synchronized boolean retainAll(Collection<?> c) {
		boolean modified = false;
		Iterator<E> e = iterator();
		while (e.hasNext()) {
			if (!c.contains(e.next())) {
				e.remove();
				modified = true;
			}
		}
		return modified;
	}

	/**
	 * Returns an iterator over the elements in this set.
	 * @return an iterator over the elements in this set.
	 */
	public Iterator<E> iterator() {
		return map.keySet().iterator();
	}

	/**
	 * Returns an array containing all of the elements in this set.
	 * @return an array containing all of the elements in this set.
	 */
	public Object[] toArray() {
		return map.keySet().toArray();
	}

	/**
	 * Returns an array containing all of the elements in this set; the runtime
	 * type of the returned array is that of the specified array.
	 * @param a the array into which the elements of this set are to be stored,
	 *            if it is big enough; otherwise, a new array of the same
	 *            runtime type is allocated for this purpose.
	 * @return an array containing the elements of this set.
	 */
	public <T> T[] toArray(T[] a) {
		return map.keySet().toArray(a);
	}
}
