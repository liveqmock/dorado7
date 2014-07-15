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

package com.bstek.dorado.view.config.attachment;

import java.util.List;

/**
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-5-31
 */
public class JavaScriptContent {
	private Object content;
	private boolean isController;
	private List<FunctionInfo> functionInfos;

	public Object getContent() {
		return content;
	}

	public void setContent(Object content) {
		this.content = content;
	}

	public boolean getIsController() {
		return isController;
	}

	public void setIsController(boolean isController) {
		this.isController = isController;
	}

	public List<FunctionInfo> getFunctionInfos() {
		return functionInfos;
	}

	public void setFunctionInfos(List<FunctionInfo> functionInfos) {
		this.functionInfos = functionInfos;
	}
}
