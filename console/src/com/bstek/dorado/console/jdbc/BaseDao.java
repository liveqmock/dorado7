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

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.bstek.dorado.console.jdbc.exception.IncorrectColumnCountException;
import com.bstek.dorado.core.store.SqlBaseStoreSupport;

/**
 * Dorado Console 数据库访问基类
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since 2012-12-13
 */
public class BaseDao {
	private SqlBaseStoreSupport baseStoreSupport;

	public SqlBaseStoreSupport getBaseStoreSupport() {
		return baseStoreSupport;
	}

	public void setBaseStoreSupport(SqlBaseStoreSupport baseStoreSupport) {
		this.baseStoreSupport = baseStoreSupport;
	}

	/**
	 * 执行Sql
	 * 
	 * @param sql
	 * @throws Exception
	 */
	public void execute(String sql) throws Exception {
		Connection conn = baseStoreSupport.getConnection();
		try {
			CallableStatement prepareCall = conn.prepareCall(sql);
			try {
				prepareCall.execute();
			} finally {
				JdbcUtils.closeStatement(prepareCall);
			}
		} finally {
			JdbcUtils.closeConnection(conn);
		}
	}

	/**
	 * 
	 * @param sql
	 * @param rowMapper
	 * @return
	 * @throws Exception
	 */
	public <T> List<T> queryForList(String sql, RowMapper<T> rowMapper)
			throws Exception {
		Connection conn = baseStoreSupport.getConnection();
		List<T> results = new ArrayList<T>();
		try {
			CallableStatement prepareCall = conn.prepareCall(sql);
			ResultSet resultSet = prepareCall.executeQuery();
			try {
				int rowNum = 0;
				while (resultSet.next()) {
					results.add(rowMapper.mapRow(resultSet, rowNum++));
				}
			} finally {
				JdbcUtils.closeResultSet(resultSet);
				JdbcUtils.closeStatement(prepareCall);
			}

		} finally {
			JdbcUtils.closeConnection(conn);
		}

		return results;
	}

	/**
	 * 执行Sql 返回List<Map<String, Object>>
	 * 
	 * @param sql
	 * @return List<Map<String, Object>>
	 * @throws Exception
	 */
	public List<Map<String, Object>> queryForList(String sql) throws Exception {
		Connection conn = baseStoreSupport.getConnection();
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		try {
			CallableStatement prepareCall = conn.prepareCall(sql);
			ResultSet resultSet = prepareCall.executeQuery();
			try {
				ResultSetMetaData rsm = resultSet.getMetaData();
				int col = rsm.getColumnCount();
				String colName[] = new String[col];
				for (int i = 0; i < col; i++) {
					colName[i] = rsm.getColumnName(i + 1);
				}
				Map<String, Object> map = new HashMap<String, Object>();
				resultSet.beforeFirst();
				while (resultSet.next()) {
					for (int i = 0; i < colName.length; i++) {
						Object object = resultSet.getObject(colName[i]);
						map.put(colName[i], object);
					}
					list.add(map);
				}
			} finally {
				JdbcUtils.closeResultSet(resultSet);
				JdbcUtils.closeStatement(prepareCall);
			}

		} finally {
			JdbcUtils.closeConnection(conn);
		}

		return list;
	}

	public int queryForInt(String sql) throws Exception {
		Connection conn = baseStoreSupport.getConnection();
		try {
			CallableStatement prepareCall = conn.prepareCall(sql);
			ResultSet resultSet = prepareCall.executeQuery();
			try {
				resultSet = prepareCall.executeQuery();
				resultSet.next();
				ResultSetMetaData rsmd = resultSet.getMetaData();
				int nrOfColumns = rsmd.getColumnCount();
				if (nrOfColumns != 1) {
					throw new IncorrectColumnCountException();
				}

				return resultSet.getInt(1);

			} finally {
				JdbcUtils.closeResultSet(resultSet);
				JdbcUtils.closeStatement(prepareCall);
			}
		} finally {
			JdbcUtils.closeConnection(conn);
		}
	}

}
