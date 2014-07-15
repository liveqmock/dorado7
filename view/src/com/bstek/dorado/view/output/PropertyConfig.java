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
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-12-4
 */
public class PropertyConfig {
	public static final Object NONE_VALUE = new Object();

	private boolean ignored;
	private Object escapeValue = NONE_VALUE;
	private Object outputter;
	private boolean evaluateExpression = true;

	public boolean isIgnored() {
		return ignored;
	}

	public void setIgnored(boolean ignored) {
		this.ignored = ignored;
	}

	public Object getEscapeValue() {
		return escapeValue;
	}

	public void setEscapeValue(Object escapeValue) {
		this.escapeValue = escapeValue;
	}

	public Object getOutputter() {
		return outputter;
	}

	public void setOutputter(Object outputter) {
		this.outputter = outputter;
	}

	public boolean isEvaluateExpression() {
		return evaluateExpression;
	}

	public void setEvaluateExpression(boolean evaluateExpression) {
		this.evaluateExpression = evaluateExpression;
	}
}
