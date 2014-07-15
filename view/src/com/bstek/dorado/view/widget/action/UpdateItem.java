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

import java.util.Properties;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.view.annotation.ComponentReference;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since May 15, 2009
 */
@XmlNode
@ClientObject
public class UpdateItem {
	private String dataSet;
	private String dataPath = "!DIRTY_TREE";
	private String alias;
	private RefreshMode refreshMode = RefreshMode.value;
	private boolean firstResultOnly;
	private boolean autoResetEntityState = true;
	private boolean submitOldData;
	private boolean submitSimplePropertyOnly;
	private Properties options;

	@ComponentReference("DataSet")
	@IdeProperty(highlight = 1)
	public String getDataSet() {
		return dataSet;
	}

	public void setDataSet(String dataSet) {
		this.dataSet = dataSet;
	}

	@ClientProperty(escapeValue = "!DIRTY_TREE")
	@IdeProperty(
			enumValues = "!DIRTY_TREE,!CASCADE_DIRTY,[#dirty],[#all],[#visible],[#current]")
	public String getDataPath() {
		return dataPath;
	}

	public void setDataPath(String dataPath) {
		this.dataPath = dataPath;
	}

	public String getAlias() {
		return alias;
	}

	public void setAlias(String alias) {
		this.alias = alias;
	}

	@ClientProperty(escapeValue = "value")
	public RefreshMode getRefreshMode() {
		return refreshMode;
	}

	public void setRefreshMode(RefreshMode refreshMode) {
		this.refreshMode = refreshMode;
	}

	public boolean isFirstResultOnly() {
		return firstResultOnly;
	}

	public void setFirstResultOnly(boolean firstResultOnly) {
		this.firstResultOnly = firstResultOnly;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isAutoResetEntityState() {
		return autoResetEntityState;
	}

	public void setAutoResetEntityState(boolean autoResetEntityState) {
		this.autoResetEntityState = autoResetEntityState;
	}

	public boolean isSubmitOldData() {
		return submitOldData;
	}

	public void setSubmitOldData(boolean submitOldData) {
		this.submitOldData = submitOldData;
	}

	public boolean isSubmitSimplePropertyOnly() {
		return submitSimplePropertyOnly;
	}

	public void setSubmitSimplePropertyOnly(boolean submitSimplePropertyOnly) {
		this.submitSimplePropertyOnly = submitSimplePropertyOnly;
	}

	public Properties getOptions() {
		return options;
	}

	public void setOptions(Properties options) {
		this.options = options;
	}

}
