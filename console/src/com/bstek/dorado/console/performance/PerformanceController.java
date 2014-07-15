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

package com.bstek.dorado.console.performance;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.InitializingBean;

import com.bstek.dorado.annotation.DataProvider;
import com.bstek.dorado.annotation.DataResolver;
import com.bstek.dorado.annotation.Expose;
import com.bstek.dorado.console.Logger;
import com.bstek.dorado.console.performance.dao.PerformanceDao;
import com.bstek.dorado.console.performance.view.MonitoredTargetVO;
import com.bstek.dorado.console.performance.view.ProcessVO;
import com.bstek.dorado.data.provider.Page;
import com.bstek.dorado.view.View;
import com.bstek.dorado.web.DoradoContext;

/**
 * 
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since 2013-3-4
 */
public class PerformanceController implements InitializingBean {
	private static final Logger logger = Logger
			.getLog(PerformanceController.class);
	private final static String V_PERFORMANCEDATATYPE = "dorado.console.performance.current.view.data.type";

	private PerformanceDao performanceDao;

	private PerformanceMonitor monitor;

	public PerformanceDao getPerformanceDao() {
		return performanceDao;
	}

	public void setPerformanceDao(PerformanceDao performanceDao) {
		this.performanceDao = performanceDao;
	}

	public void onReady(View view) {
		HttpServletRequest request = DoradoContext.getAttachedRequest();
		String type = request.getParameter("type");
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("type", type);
		view.setUserData(map);
		DoradoContext.getCurrent().setAttribute(DoradoContext.VIEW,
				V_PERFORMANCEDATATYPE, type);
	}

	/**
	 * 获得最近发生的请求列表
	 * 
	 * @return
	 */
	@DataProvider
	public List<ProcessVO> getLastProcessList() {
		String type = (String) DoradoContext.getCurrent().getAttribute(
				DoradoContext.VIEW, V_PERFORMANCEDATATYPE);
		List<ProcessVO> list = new ArrayList<ProcessVO>();
		Map<String, Process> map = monitor.getLastProcessMap();
		Map<String, MonitoredTarget> targets = monitor.getMonitoredTargets();
		ProcessVO vo;
		Process process;
		Iterator<Process> iterator = map.values().iterator();
		while (iterator.hasNext()) {
			process = iterator.next();
			if (StringUtils.isNotEmpty(type) && !type.equals(process.getType())) {
				continue;
			}
			vo = new ProcessVO();
			vo.setName(process.getName());
			vo.setSpendTime(process.getSpendTime());
			vo.setFreeMemory(process.getFreeMemory());
			vo.setStatus(targets.get(process.getName()) != null);
			vo.setTime(process.getTime());
			vo.setType(process.getType());
			list.add(vo);
		}
		class ComparatorProcess implements Comparator<ProcessVO> {
			public int compare(ProcessVO o1, ProcessVO o2) {
				return (int) (o2.getTime() - o1.getTime());
			}
		}
		Collections.sort(list, new ComparatorProcess());
		return list;
	}

	@Expose
	public Category getCategory(String name) {
		return monitor.getCategory(name);
	}

	@DataProvider
	public void getProcessList(Page<Process> page, String name)
			throws Exception {
		try {
			monitor.saveProcessListToDB();
		} catch (Exception e) {
			logger.error(e, e);
		}
		performanceDao.getProcessList(page, name);
	}

	@DataProvider
	public List<MonitoredTargetVO> getTargetList() throws Exception {
		String type = (String) DoradoContext.getCurrent().getAttribute(
				DoradoContext.VIEW, V_PERFORMANCEDATATYPE);
		List<MonitoredTargetVO> monitoredTargets = new ArrayList<MonitoredTargetVO>();
		Collection<MonitoredTarget> targets = monitor.getMonitoredTargets()
				.values();
		MonitoredTargetVO vo;
		MonitoredTarget target;
		Category category;
		String name;
		Map<String, Category> map = monitor.getCategoryMap();
		for (Iterator<MonitoredTarget> iterator = targets.iterator(); iterator
				.hasNext();) {
			target = iterator.next();
			if (StringUtils.isNotEmpty(type) && !type.equals(target.getType())) {
				continue;
			}
			name = target.getName();
			vo = new MonitoredTargetVO();
			vo.setName(name);
			vo.setType(target.getType());
			category = map.get(name);
			vo.setAvgTime(category.getAvgTime());
			vo.setMaxTime(category.getMaxTimeProcess().getSpendTime());
			vo.setMinTime(category.getMinTimeProcess().getSpendTime());
			vo.setCount(category.getCount());
			Process lastProcess = monitor.getLastProcessMap().get(name);
			if (category.getCount() > 0) {
				long timeLength = lastProcess.getTime()
						- category.getFirstProcess().getTime();
				vo.setFrequency(timeLength / category.getCount());
			}
			vo.setStatus(true);
			vo.setTime(lastProcess.getTime());
			vo.setFreeMemory(lastProcess.getFreeMemory());
			vo.setSpendTime(lastProcess.getSpendTime());
			monitoredTargets.add(vo);
		}

		class ComparatorTarget implements Comparator<MonitoredTargetVO> {
			public int compare(MonitoredTargetVO o1, MonitoredTargetVO o2) {
				return (int) (o1.getMonitoringTime() - o2.getMonitoringTime());
			}
		}
		Collections.sort(monitoredTargets, new ComparatorTarget());
		return monitoredTargets;
	}

	@Expose
	public boolean addMonitoredTarget(String name, String type) {
		MonitoredTarget target = new MonitoredTarget();
		target.setName(name);
		target.setMonitoringTime(System.currentTimeMillis());
		target.setStatus(true);
		target.setId(UUID.randomUUID().toString());
		target.setType(type);
		return monitor.addMonitoredTarget(target);
	}

	@DataResolver
	public void addMonitoredTargets(List<ProcessVO> list) {
		MonitoredTarget target;
		for (ProcessVO processVO : list) {
			target = new MonitoredTarget();
			target.setName(processVO.getName());
			target.setMonitoringTime(System.currentTimeMillis());
			target.setStatus(true);
			target.setId(UUID.randomUUID().toString());
			target.setType(processVO.getType());
			monitor.addMonitoredTarget(target);
		}
	}

	@DataResolver
	public void removeMonitoredTargets(List<MonitoredTargetVO> list) {
		for (MonitoredTargetVO vo : list) {
			monitor.removeMonitoredTarget(vo.getName());
		}
	}

	@Expose
	public void removeMonitoredTarget(String name, String type) {

	}

	public void afterPropertiesSet() throws Exception {
		monitor = PerformanceMonitor.getInstance();
	}

}
