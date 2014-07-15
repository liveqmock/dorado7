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

package com.bstek.dorado.view.widget.action;

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.view.annotation.Widget;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2014-1-20
 */

@Widget(name = "LongTask", category = "Action", dependsPackage = "base-widget", autoGenerateId = true)
@XmlNode(parser = "spring:dorado.longTaskParser")
@ClientObject(prototype = "dorado.widget.LongTask", shortTypeName = "LongTask")
@ClientEvents({ @ClientEvent(name = "onTaskScheduled"),
		@ClientEvent(name = "onTaskEnd"), @ClientEvent(name = "onStateChange"),
		@ClientEvent(name = "onLog") })
public class LongTask extends Action {
	private String taskName;
	private LongTaskAppearence appearence = LongTaskAppearence.daemonTask;
	private boolean disableOnActive = true;

	@IdeProperty(highlight = 1)
	public String getTaskName() {
		return taskName;
	}

	public void setTaskName(String taskName) {
		this.taskName = taskName;
	}

	@ClientProperty(escapeValue = "daemonTask")
	public LongTaskAppearence getAppearence() {
		return appearence;
	}

	public void setAppearence(LongTaskAppearence appearence) {
		this.appearence = appearence;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isDisableOnActive() {
		return disableOnActive;
	}

	public void setDisableOnActive(boolean disableOnActive) {
		this.disableOnActive = disableOnActive;
	}

}
