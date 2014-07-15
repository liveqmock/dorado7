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

/**
 * View创建过程日志输出器
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since 2013-3-1
 */
public class CreateViewLogOutputter extends ExecuteLogOutputter {

	@Override
	protected String doOutStartLog(String type, String serviceName,
			String message) {
		// TODO Auto-generated method stub
		return String.format(" Processing %s , request url=%s. [Start]",
				serviceName, message);
	}

	@Override
	protected String doOutEndLog(String type, String serviceName, String message) {
		// TODO Auto-generated method stub
		return String.format(" Successfully completed %s. [End]", serviceName);
	}

}
