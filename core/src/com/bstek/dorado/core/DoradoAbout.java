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

package com.bstek.dorado.core;

import java.rmi.dgc.VMID;

import org.apache.commons.lang.StringUtils;

/**
 * 用于获取各种Dorado基本信息的工具类。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 27, 2007
 */
public class DoradoAbout {
	private static String instanceId = new VMID().toString();
	private static long instantiationTime = System.currentTimeMillis();

	/**
	 * 返回产品名称。
	 */
	public static String getProductTitle() {
		return "dorado";
	}

	/**
	 * 返回产品提供商。
	 */
	public static String getVendor() {
		return "www.BSTEK.com";
	}

	/**
	 * 返回产品版本号。
	 */
	public static String getVersion() {
		Package pkg = DoradoAbout.class.getPackage();
		String version = null;
		if (pkg != null) version = pkg.getImplementationVersion();
		if (StringUtils.isEmpty(version)) version = instanceId;
		return version;
	}

	/**
	 * 返回dorado的实例id。
	 */
	public static String getInstanceId() {
		return instanceId;
	}

	/**
	 * 返回该dorado的实例的创建时间。
	 */
	public static long getInstantiationTime() {
		return instantiationTime;
	}
}
