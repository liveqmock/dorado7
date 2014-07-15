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

import java.util.EventObject;

public class Event extends EventObject {

	private static final long serialVersionUID = 2592537553806095543L;

	private LogLine syslog;
	
	public Event(Object monitor, LogLine syslog) {
		super(monitor);
		this.syslog = syslog;
	}
	
	public LogLine getObject() {
		return syslog;
	}

}
