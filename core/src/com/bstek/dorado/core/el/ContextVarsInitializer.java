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

package com.bstek.dorado.core.el;

import java.util.Map;

/**
 * EL上下文中隐式变量集合的初始化器。
 * <p>
 * EL上下文中的隐式变量常常被理解为EL表达式的前缀。<br>
 * 例如，假设我们将一个{@link java.util.Date}以<code>Date</code>的前缀放入到隐式变量集合中， 即
 *
 * <pre>
 * vars.put(&quot;Date&quot;, new java.util.Date(););
 * </pre>
 *
 * 。<br>
 * 而后，我们就可以在EL表达式中这样来使用该Date对象了
 *
 * <pre>
 * ${Date.toLocaleString()}
 * </pre>
 *
 * 。
 * </p>
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 4, 2007
 */
public interface ContextVarsInitializer {
	/**
	 * 初始化隐式变量。
	 * @param vars 隐式变量映射集合。其中Map的键值为隐式变量的变量名，Map的值为隐式变量自身。
	 */
	void initializeContext(Map<String, Object> vars) throws Exception;
}
