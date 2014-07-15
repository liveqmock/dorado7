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

package com.bstek.dorado.config.definition;


/**
 * 用于封装初始化操作的通用接口。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 7, 2008
 */
public interface Operation extends Cloneable {
	/**
	 * 执行该初始化方法。
	 * @param object 将被初始化的对象。
	 * @param context 创建最终对象的上下文
	 * @throws Exception
	 */
	void execute(Object object, CreationContext context) throws Exception;
}
