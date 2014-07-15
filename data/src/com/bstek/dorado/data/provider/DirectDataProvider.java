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

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Set;

import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.data.type.DataType;

/**
 * 直接型DataProvider。
 * <p>
 * 由于此类DataProvider所返回的数据是直接定义在其result属性当中的， 因此被称为直接型DataProvider。
 * </p>
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 3, 2007
 */
@XmlNode(fixedProperties = "type=direct")
public class DirectDataProvider extends AbstractDataProvider {
	private Object result;

	@Override
	@XmlProperty(parser = "spring:dorado.dataParser")
	@IdeProperty(editor = "pojo")
	public Object getResult() throws Exception {
		return super.getResult();
	}

	/**
	 * 设置要返回给外界的数据。
	 */
	public void setResult(Object result) {
		this.result = result;
	}

	@Override
	protected Object internalGetResult(Object parameter, DataType resultDataType)
			throws Exception {
		// 此处未处理resultDataType，因为运行时的动态代理会去处理
		return result;
	}

	@Override
	@SuppressWarnings({ "unchecked", "rawtypes" })
	protected void internalGetPagingResult(Object parameter, Page page,
			DataType resultDataType) throws Exception {
		// 此处未处理resultDataType，因为运行时的动态代理会去处理
		if (result == null) {
			page.setEntities(null);
			page.setEntityCount(0);
		}

		if (result instanceof Collection) {
			if (result instanceof List) {
				List<Object> list = ((List<Object>) result);
				page.setEntities(list.subList(page.getFirstEntityIndex(),
						page.getLastEntityIndex()));
				page.setEntityCount(list.size());
			} else {
				List<Object> list = new ArrayList<Object>();
				int index = 0, firstIndex = page.getFirstEntityIndex(), lastIndex = page
						.getLastEntityIndex();
				Set<Object> set = (Set<Object>) result;
				for (Object e : set) {
					if (index >= firstIndex) {
						list.add(e);
						if (index >= lastIndex)
							break;
					}
					index++;
				}
				page.setEntities(list);
				page.setEntityCount(set.size());
			}
		} else {
			List<Object> list = new ArrayList<Object>();
			list.add(result);
			page.setEntities(list);
			page.setEntityCount(1);
		}
	}
}
