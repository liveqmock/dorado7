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
 * 属性输出器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jun 4, 2009
 */
public interface PropertyOutputter {

	/**
	 * 判断传入的数值是否该属性的默认值。
	 */
	public boolean isEscapeValue(Object value);

	/**
	 * @param object
	 * @param context
	 * @throws Exception
	 */
	void output(Object object, OutputContext context) throws Exception;
}
