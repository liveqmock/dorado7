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

package com.bstek.dorado.view.widget.datacontrol;

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.view.annotation.Widget;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-11-24
 */
@Widget(name = "DataPilot", category = "General",
		dependsPackage = "base-widget")
@ClientObject(prototype = "dorado.widget.DataPilot",
		shortTypeName = "DataPilot")
@ClientEvents({ @ClientEvent(name = "onSubControlRefresh"),
		@ClientEvent(name = "onSubControlAction") })
public class DataPilot extends AbstractDataControl {
	private String itemCodes;

	@IdeProperty(enumValues = "pages,|<,<,>,>|,goto,pageSize,info,+,-,x,|",
			highlight = 1)
	public String getItemCodes() {
		return itemCodes;
	}

	public void setItemCodes(String itemCodes) {
		this.itemCodes = itemCodes;
	}
}
