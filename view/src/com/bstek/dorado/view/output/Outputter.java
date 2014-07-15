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

package com.bstek.dorado.view.output;

/**
 * 视图对象输出器的通用接口。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 4, 2008
 */
public interface Outputter {
	/**
	 * 输出组件。
	 * @param object 要输出的对象。
	 * @param context 输出上下文。
	 * @throws Exception
	 */
	void output(Object object, OutputContext context) throws Exception;
}
