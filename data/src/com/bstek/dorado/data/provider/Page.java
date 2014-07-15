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

package com.bstek.dorado.data.provider;

import java.util.Collection;
import java.util.Collections;
import java.util.Iterator;

/**
 * 分页数据的包装类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apirl 15, 2007
 */
public class Page<T> {
	private int pageSize;
	private int pageNo;
	private int firstEntityIndex;
	private int lastEntityIndex;

	private Collection<T> entities;
	private int entityCount;
	private int pageCount;

	/**
	 * @param pageSize
	 *            每页记录数
	 * @param pageNo
	 *            页号
	 */
	public Page(int pageSize, int pageNo) {
		if (pageNo > 1 && pageSize <= 0) {
			throw new IllegalArgumentException(
					"Illegal paging arguments. [pageSize=" + pageSize
							+ ", pageIndex=" + pageNo + "]");
		}

		if (pageSize < 0)
			pageSize = 0;
		if (pageNo < 1)
			pageNo = 1;

		this.pageSize = pageSize;
		this.pageNo = pageNo;
		firstEntityIndex = (pageNo - 1) * pageSize;
		lastEntityIndex = pageNo * pageSize;
	}

	/**
	 * 返回每一页的大小，即每页的记录数。
	 */
	public int getPageSize() {
		return pageSize;
	}

	/**
	 * 返回要提取的页的序号，该序号是从1开始计算的。
	 */
	public int getPageNo() {
		return pageNo;
	}

	/**
	 * 返回当前页中第一条记录对应的序号，该序号是从0开始计算的。<br>
	 * 注意，此处在计算firstEntityIndex是不考虑实际提取过程中当前页是否存在的。
	 */
	public int getFirstEntityIndex() {
		return firstEntityIndex;
	}

	/**
	 * 返回当前页中最后一条记录对应的序号，该序号是从0开始计算的。<br>
	 * 注意，此处在计算lastEntityIndex是不考虑实际提取过程中当前页是否存在或者记录数是否可达到pageSize的。
	 */
	public int getLastEntityIndex() {
		return lastEntityIndex;
	}

	/**
	 * 设置当页数据。
	 */
	public void setEntities(Collection<T> entities) {
		this.entities = entities;
	}

	/**
	 * 返回当页数据。
	 */
	@SuppressWarnings("unchecked")
	public Collection<T> getEntities() {
		return (entities != null) ? entities : Collections.EMPTY_LIST;
	}

	/**
	 * 设置总记录数。
	 * <p>
	 * 此处的总记录数并不是指当页数据的总数，而是指整个结果的总数。 即每一页数据累计的总数。
	 * </p>
	 */
	public int getEntityCount() {
		return entityCount;
	}

	/**
	 * 返回总记录数。
	 * <p>
	 * 此处的总记录数并不是指当页数据的总数，而是指整个结果的总数。即每一页数据累计的总数。
	 * </p>
	 */
	public void setEntityCount(int entityCount) {
		if (entityCount < 0) {
			throw new IllegalArgumentException(
					"Illegal entityCount arguments. [entityCount="
							+ entityCount + "]");
		}

		this.entityCount = entityCount;
		pageCount = ((entityCount - 1) / pageSize) + 1;
	}

	/**
	 * 返回总的记录页数。
	 */
	public int getPageCount() {
		return pageCount;
	}

	/**
	 * 返回当页数据的迭代器。
	 */
	public Iterator<T> iterator() {
		if (entities != null) {
			return entities.iterator();
		} else {
			return null;
		}
	}
}
