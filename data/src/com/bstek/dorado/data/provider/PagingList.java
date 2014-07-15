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

import java.io.InvalidObjectException;
import java.io.ObjectStreamException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.util.proxy.ListProxySupport;

/**
 * 支持数据分页的List。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apr 3, 2008
 */
public class PagingList<E> extends ListProxySupport<E> {
	private static final long serialVersionUID = -2663699029002561283L;
	private static final Log logger = LogFactory.getLog(PagingList.class);

	private DataProvider dataProvider;
	private DataType dataType;
	private Object parameter;
	private int pageSize;
	private int pageNo;
	private int entityCount;
	private int pageCount;

	private Map<Integer, Page<E>> pageMap = new HashMap<Integer, Page<E>>();

	@SuppressWarnings("unchecked")
	public PagingList(DataProvider dataProvider, DataType dataType,
			Object parameter, int pageSize, int pageNo) throws Exception {
		super((List<E>) Collections.emptyList());
		this.dataProvider = dataProvider;
		this.dataType = dataType;
		this.parameter = parameter;
		this.pageSize = pageSize;
		this.gotoPage(pageNo);
	}

	public PagingList(DataProvider dataProvider, DataType dataType,
			Object parameter, int pageSize) throws Exception {
		this(dataProvider, dataType, parameter, pageSize, 1);
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
	 * 返回总记录数。
	 * <p>
	 * 此处的总记录数并不是指当页数据的总数，而是指整个结果的总数。即每一页数据累计的总数。
	 * </p>
	 */
	public int getEntityCount() {
		return entityCount;
	}

	/**
	 * 设置总记录数。
	 * <p>
	 * 此处的总记录数并不是指当页数据的总数，而是指整个结果的总数。 即每一页数据累计的总数。
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
	 * 跳转到第一页。<br>
	 * 执行此操作后List中封装的数据将变为第一页的数据。
	 * 
	 * @throws Exception
	 */
	public void gotoFirstPage() throws Exception {
		gotoPage(1);
	}

	/**
	 * 跳转到上一页。<br>
	 * 执行此操作后List中封装的数据将变为上一页的数据。
	 * 
	 * @throws Exception
	 */
	public void gotoPreviousPage() throws Exception {
		gotoPage(pageNo + 1);
	}

	/**
	 * 跳转到下一页。<br>
	 * 执行此操作后List中封装的数据将变为下一页的数据。
	 * 
	 * @throws Exception
	 */
	public void gotoNextPage() throws Exception {
		gotoPage(pageNo - 1);
	}

	/**
	 * 跳转到最后一页。<br>
	 * 执行此操作后List中封装的数据将变为最后一页的数据。
	 * 
	 * @throws Exception
	 */
	public void gotoLastPage() throws Exception {
		gotoPage(pageCount);
	}

	protected Page<E> getPage(int pageNo) throws Exception {
		Page<E> page = pageMap.get(pageNo);
		if (page == null) {
			page = new Page<E>(pageSize, pageNo);
			dataProvider.getPagingResult(parameter, page, dataType);
			pageMap.put(pageNo, page);
		}
		return page;
	}

	/**
	 * 跳转到指定的页。<br>
	 * 执行此操作后List中封装的数据将变为指定页的数据。
	 * 
	 * @param pageNo
	 * @throws Exception
	 */
	public void gotoPage(int pageNo) throws Exception {
		if (pageNo > pageCount) {
			pageNo = pageCount;
		}
		if (pageNo < 1) {
			pageNo = 1;
		}

		if (pageNo != this.pageNo) {
			Page<E> page = getPage(pageNo);
			setTarget(page.getEntities());

			this.pageNo = pageNo;
			entityCount = page.getEntityCount();
			pageCount = page.getPageCount();
		}
	}

	@Override
	public Object writeReplace() throws ObjectStreamException {
		try {
			List<E> list = new ArrayList<E>();
			for (int i = 1; i <= pageCount; i++) {
				Page<E> page = getPage(pageNo);
				list.addAll(page.getEntities());
			}
			return list;
		} catch (Exception e) {
			logger.error(e, e);
			throw new InvalidObjectException(e.getMessage());
		}
	}
}
