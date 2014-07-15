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

package com.bstek.dorado.console.jdbc;

import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Dorado Console 数据库行解析器接口
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since 2012-12-13
 */
public interface RowMapper<T> {
	/**
	 * 
	 * @param resultset
	 *            当前resultset
	 * @param rowNum
	 *            行号
	 * @return
	 * @throws SQLException
	 */
	public abstract T mapRow(ResultSet resultset, int rowNum)
			throws SQLException;
}
