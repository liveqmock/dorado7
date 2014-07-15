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

/**
 * 具有筛选功能的数据实体迭代器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jan 17, 2008
 */
public class EntityIterator<E> implements Iterator<E>, Iterable<E> {
	private Iterator<E> iterator;
	private FilterType filterType;
	private boolean hasNext;
	private E lastEntity;
	private E currentEntity;

	/**
	 * @param entities
	 *            数据实体的集合
	 * @param filter
	 *            筛选方式。可选的筛选方式包括：
	 */
	public EntityIterator(Collection<E> entities, FilterType filterType) {
		iterator = entities.iterator();
		this.filterType = filterType;
		findNext();
	}

	/**
	 * 寻找下一个有效的数据实体。
	 */
	protected void findNext() {
		if (iterator.hasNext()) {
			currentEntity = iterator.next();
			if (currentEntity != null) {
				boolean visible = false;
				EntityState state = EntityUtils.getState(currentEntity);
				if (filterType == FilterType.NONE) {
					visible = (state == EntityState.NONE);
				} else if (filterType == FilterType.NEW) {
					visible = (state == EntityState.NEW);
				} else if (filterType == FilterType.MODIFIED) {
					visible = (state == EntityState.MODIFIED);
				} else if (filterType == FilterType.DELETED) {
					visible = (state == EntityState.DELETED);
				} else if (filterType == FilterType.MOVED) {
					visible = (state == EntityState.MOVED);
				} else if (filterType == FilterType.VISIBLE) {
					visible = (state != EntityState.DELETED);
				} else if (filterType == FilterType.DIRTY) {
					visible = (state == EntityState.NEW
							|| state == EntityState.MODIFIED
							|| state == EntityState.DELETED || state == EntityState.MOVED);
				} else if (filterType == FilterType.VISIBLE) {
					visible = (state == EntityState.NEW
							|| state == EntityState.MODIFIED || state == EntityState.MOVED);
				} else if (filterType == FilterType.ALL) {
					visible = true;
				}

				if (visible) {
					hasNext = true;
				} else {
					findNext();
				}
			} else {
				hasNext = false;
			}
		} else {
			hasNext = false;
		}
	}

	public boolean hasNext() {
		return hasNext;
	}

	public E next() {
		lastEntity = currentEntity;
		findNext();
		return lastEntity;
	}

	public void remove() {
		if (lastEntity == null) {
			throw new IllegalStateException("No current entity found.");
		}
		EntityUtils.markDeleted(lastEntity);
		lastEntity = null;
	}

	public Iterator<E> iterator() {
		return this;
	}

}
