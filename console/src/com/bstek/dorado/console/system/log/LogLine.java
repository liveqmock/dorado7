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

package com.bstek.dorado.console.system.log;

public class LogLine {

	private String level;
	private String line;
	
	public LogLine(){}
	
	public LogLine(String line, String level) {
		this.line = line;
		this.level = level;
	}
	
	public String getLevel() {
		return level;
	}

	public String getLine() {
		return line;
	}

	public void setLevel(String level) {
		this.level = level;
	}

	public void setLine(String line) {
		this.line = line;
	}
	
}
