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

import java.util.ArrayList;
import java.util.List;

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.annotation.XmlSubNode;
import com.bstek.dorado.data.resolver.DataResolver;
import com.bstek.dorado.view.annotation.Widget;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since May 13, 2009
 */
@Widget(name = "UpdateAction", category = "Action", dependsPackage = "base-widget", autoGenerateId = true)
@ClientObject(prototype = "dorado.widget.UpdateAction", shortTypeName = "UpdateAction")
@XmlNode(parser = "spring:dorado.updateActionParser")
@ClientEvents({ @ClientEvent(name = "onGetUpdateData") })
public class UpdateAction extends AsyncAction {
	private DataResolver dataResolver;
	private List<UpdateItem> UpdateItems = new ArrayList<UpdateItem>();
	private boolean alwaysExecute;

	@Override
	@ClientProperty(alwaysOutput = true)
	public String getExecutingMessage() {
		return super.getExecutingMessage();
	}

	@XmlProperty(ignored = true)
	@ClientProperty(outputter = "spring:dorado.dataResolverPropertyOutputter")
	@IdeProperty(highlight = 1)
	public DataResolver getDataResolver() {
		return dataResolver;
	}

	public void setDataResolver(DataResolver dataResolver) {
		this.dataResolver = dataResolver;
	}

	@XmlSubNode
	@ClientProperty
	public List<UpdateItem> getUpdateItems() {
		return UpdateItems;
	}

	public boolean isAlwaysExecute() {
		return alwaysExecute;
	}

	public void setAlwaysExecute(boolean alwaysExecute) {
		this.alwaysExecute = alwaysExecute;
	}
}
