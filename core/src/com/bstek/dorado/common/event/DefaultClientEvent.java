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

package com.bstek.dorado.common.event;

/**
 * 默认的客户端事件监听器实现。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apr 11, 2008
 */
public class DefaultClientEvent implements DynaSignatureClientEvent {
	private String signature;
	private String script;

	/**
	 * 构造器。
	 */
	public DefaultClientEvent() {
	}

	/**
	 * 构造器。
	 */
	public DefaultClientEvent(String script) {
		setScript(script);
	}

	/**
	 * 构造器。
	 */
	public DefaultClientEvent(String signature, String script) {
		setSignature(signature);
		setScript(script);
	}

	public String getSignature() {
		return signature;
	}

	public void setSignature(String signature) {
		this.signature = signature;
	}

	/**
	 * 设置监听器的JavaScript脚本。
	 */
	public void setScript(String script) {
		this.script = script;
	}

	public String getScript() {
		return script;
	}

}
