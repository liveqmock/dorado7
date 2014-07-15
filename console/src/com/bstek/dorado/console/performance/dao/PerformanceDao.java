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

package com.bstek.dorado.console.performance.dao;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;

import com.bstek.dorado.console.jdbc.BaseDao;
import com.bstek.dorado.console.jdbc.JdbcUtils;
import com.bstek.dorado.console.jdbc.RowMapper;
import com.bstek.dorado.console.performance.MonitoredTarget;
import com.bstek.dorado.console.performance.Process;
import com.bstek.dorado.data.provider.Page;

/**
 * 性能监控数据库访问类
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since 2012-12-13
 * 
 */
public class PerformanceDao extends BaseDao {
	/**
	 * 保存 MonitoredTarget
	 * 
	 * @param process
	 * @throws Exception
	 */
	public void saveMonitoredTarget(MonitoredTarget process) throws Exception {
		String sql = String
				.format("insert into T_MonitoredTarget(f_id,f_name,f_monitoringTime,f_cancelTime,f_status,f_description,f_type) values ('%s','%s','%s','%s','%s','%s','%s')",
						process.getId(), process.getName(),
						process.getMonitoringTime(), process.getCancelTime(),
						process.getStatus(), process.getDescription(),
						process.getType());
		execute(sql);
	}

	/**
	 * 保存 Process 信息
	 * 
	 * @param execInfo
	 * @throws Exception
	 */
	public void saveProcessInfo(Process process) throws Exception {
		String sql = String
				.format("insert into T_Process(F_name,F_time,F_spendTime,F_freeMemory) values ('%s','%s','%s','%s')",
						process.getName(), process.getTime(),
						process.getSpendTime(), process.getFreeMemory());
		execute(sql);
	}

	/**
	 * 批量保存监控数据
	 * 
	 * @param list
	 * @throws Exception
	 */
	public void saveProcessList(List<Process> list) throws Exception {

		Connection conn = getBaseStoreSupport().getConnection();
		try {
			Statement stmt = conn.createStatement();
			try {
				String sql;
				for (Process process : list) {
					sql = String
							.format("insert into T_Process(F_name,F_time,F_spendTime,F_freeMemory) values ('%s','%s','%s','%s')",
									process.getName(), process.getTime(),
									process.getSpendTime(),
									process.getFreeMemory());
					stmt.addBatch(sql);
				}
				stmt.executeBatch();

			} finally {
				JdbcUtils.closeStatement(stmt);
			}

		} finally {
			JdbcUtils.closeConnection(conn);
		}

	}

	/**
	 * 
	 * @param name
	 * @return
	 * @throws Exception
	 */
	public List<Process> getProcessList(String name) throws Exception {
		String sql = String.format(
				"SELECT * FROM T_Process T WHERE 1=1 AND t.f_name='%s'", name);
		return queryForList(sql, new ProcessRowMapper());
	}

	/**
	 * 分页查询性能数据
	 * 
	 * @param page
	 * @param name
	 * @throws Exception
	 */
	public void getProcessList(Page<Process> page, String name)
			throws Exception {
		int pageIndex = page.getPageNo(), pageSize = page.getPageSize();
		int start = (pageIndex - 1) * pageSize, end = pageIndex * pageSize;
		String qrySql = String
				.format("SELECT * FROM ( SELECT rownum AS r,T.*  FROM T_Process T WHERE 1=1 AND t.f_name='%s' ORDER BY t.f_time DESC) t2 WHERE t2.r>%s AND t2.r<=%s",
						name, start, end);
		String countSql = String
				.format("SELECT  COUNT(*) as c  FROM T_Process T WHERE 1=1 AND t.f_name='%s' ",
						name);
		List<Process> list = queryForList(qrySql, new ProcessRowMapper());
		page.setEntities(list);
		page.setEntityCount(queryForInt(countSql));
	}

	/**
	 * 
	 * @return
	 * @throws Exception
	 */
	public List<MonitoredTarget> getTargetList() throws Exception {
		StringBuffer sql = new StringBuffer(
				"SELECT * FROM T_MonitoredTarget t WHERE 1=1 ");
		return queryForList(sql.toString(), new MonitoredTargetRowMapper());
	}

}

class MonitoredTargetRowMapper implements RowMapper<MonitoredTarget> {

	public MonitoredTarget mapRow(ResultSet resultset, int i)
			throws SQLException {
		MonitoredTarget target = new MonitoredTarget();
		target.setId(resultset.getString("f_id"));
		target.setName(resultset.getString("f_name"));
		target.setMonitoringTime(resultset.getLong("f_monitoringtime"));
		target.setCancelTime(resultset.getLong("f_canceltime"));
		target.setStatus(resultset.getBoolean("f_status"));
		target.setDescription(resultset.getString("f_description"));
		target.setType(resultset.getString("f_type"));
		return target;
	}

}

class ProcessRowMapper implements RowMapper<Process> {

	public Process mapRow(ResultSet resultset, int i) throws SQLException {
		Process process = new Process();
		process.setName(resultset.getString("f_name"));
		process.setTime(resultset.getLong("f_time"));
		process.setSpendTime(resultset.getLong("f_spendTime"));
		process.setFreeMemory(resultset.getLong("f_freeMemory"));
		return process;
	}

}
