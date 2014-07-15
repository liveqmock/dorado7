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

import org.springframework.beans.factory.InitializingBean;

import com.bstek.dorado.spring.RemovableBean;

/**
 * Dorado引擎的启动过程监听器。
 * <p>
 * 在目前的默认实现方式中，只要将EngineStartupListener的实现类注册到Spring的配置中，
 * Dorado引擎就会在启动之后自动的激活所有的EngineStartupListener的实现类。
 * </p>
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 9, 2007
 */
public abstract class EngineStartupListener implements InitializingBean,
		RemovableBean {
	private int order = 999;

	/**
	 * 当Dorado引擎被启动时触发的动作。
	 * 
	 * @throws Exception
	 */
	public abstract void onStartup() throws Exception;

	public int getOrder() {
		return order;
	}

	public void setOrder(int order) {
		this.order = order;
	}

	public void afterPropertiesSet() throws Exception {
		EngineStartupListenerManager.register(this);
	}
}
