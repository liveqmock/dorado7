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

package com.bstek.dorado.console.utils;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

/**
 * System 辅助类
 * 
 * @author Alex Tong (mailto:alex.tong@bstek.com)
 * @since 2012-12-07
 */
public class SystemUtils {

	/**
	 * 获取系统参数
	 * 
	 * @return
	 */
	public static Map<String, Object> getSystemProperties() {
		Map<String, Object> map = new HashMap<String, Object>();

		map.put("os_name", System.getProperty("os.name"));
		map.put("os_arch", System.getProperty("os.arch"));
		map.put("os_version", System.getProperty("os.version"));
		map.put("user_name", System.getProperty("user.name"));
		map.put("class_path", System.getProperty("java.class.path"));
		map.put("file_encoding", System.getProperty("file.encoding"));
		map.put("library_path", StringUtils.replace(
				System.getProperty("java.library.path"), ";", "<br>"));
		map.put("java_version", System.getProperty("java.version"));
		map.put("java_vendor", System.getProperty("java.vendor"));
		map.put("java_vm_specification_version",
				System.getProperty("java.vm.specification.version"));
		map.put("java_vm_specification_vendor",
				System.getProperty("java.vm.specification.vendor"));
		map.put("java_vm_specification_name	",
				System.getProperty("java.vm.specification.name"));
		map.put("java_vm_version", System.getProperty("java.vm.version"));
		map.put("java_vm_vendor", System.getProperty("java.vm.vendor"));
		map.put("java_vm_name", System.getProperty("java.vm.name"));
		map.put("java_home", System.getProperty("java.home"));

		return map;
	}

	/**
	 * 获得当前运行环境内存状况
	 * 
	 * @return
	 */
	public static Map<String, Object> getMemoryInfo() {
		Map<String, Object> map = new HashMap<String, Object>();
		Runtime runtime = Runtime.getRuntime();
		map.put("runtime", runtime);

		map.put("freeMemory", runtime.freeMemory());
		map.put("totalMemory", runtime.totalMemory());
		if (System.getProperty("java.version").compareTo("1.4") >= 0)
			map.put("maxMemory", runtime.maxMemory());
		else
			map.put("maxMemory", "N/A");

		map.put("CPU", runtime.availableProcessors());
		return map;
	}

}
