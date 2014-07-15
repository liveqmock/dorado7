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

package com.bstek.dorado.view.widget.tree;

import java.util.ArrayList;
import java.util.List;

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlNodeWrapper;
import com.bstek.dorado.annotation.XmlSubNode;
import com.bstek.dorado.view.annotation.ComponentReference;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.datacontrol.DataControl;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-9-30
 */
@Widget(name = "DataTree", category = "Collection", dependsPackage = "tree")
@ClientObject(prototype = "dorado.widget.DataTree", shortTypeName = "DataTree")
@ClientEvents({ @ClientEvent(name = "beforeDataNodeCreate"),
		@ClientEvent(name = "onDataNodeCreate") })
public class DataTree extends AbstractTree implements DataControl {
	private String dataSet;
	private String dataPath;
	private String currentNodeDataPath;

	private List<BindingConfig> bindingConfigs = new ArrayList<BindingConfig>();

	@ComponentReference("DataSet")
	@IdeProperty(highlight = 1)
	public String getDataSet() {
		return dataSet;
	}

	public void setDataSet(String dataSet) {
		this.dataSet = dataSet;
	}

	@IdeProperty(highlight = 1)
	public String getDataPath() {
		return dataPath;
	}

	public void setDataPath(String dataPath) {
		this.dataPath = dataPath;
	}

	public String getCurrentNodeDataPath() {
		return currentNodeDataPath;
	}

	public void setCurrentNodeDataPath(String currentNodeDataPath) {
		this.currentNodeDataPath = currentNodeDataPath;
	}

	@XmlSubNode(wrapper = @XmlNodeWrapper(nodeName = "BindingConfigs",
			icon = "/com/bstek/dorado/view/widget/tree/BindingConfigs.png"))
	@ClientProperty
	public List<BindingConfig> getBindingConfigs() {
		return bindingConfigs;
	}

	public void addBindingConfig(BindingConfig bindingConfig) {
		bindingConfigs.add(bindingConfig);
	}
}
