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

package com.bstek.dorado.view.widget.grid;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.data.type.EntityDataType;
import com.bstek.dorado.view.annotation.ComponentReference;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.datacontrol.DataControl;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-9-29
 */
@Widget(name = "DataGrid", category = "Collection", dependsPackage = "grid")
@ClientObject(prototype = "dorado.widget.DataGrid", shortTypeName = "DataGrid")
public class DataGrid extends AbstractGrid implements DataControl {
	private String dataSet;
	private String dataPath;
	private EntityDataType dataType;
	private boolean supportsPaging;
	private Boolean autoCreateColumns;
	private FilterMode filterMode = FilterMode.clientSide;
	private SortMode sortMode = SortMode.clientSide;
	private String rowSelectionProperty;

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

	@XmlProperty(parser = "spring:dorado.dataTypePropertyParser",
			deprecated = true)
	public EntityDataType getDataType() {
		return dataType;
	}

	public void setDataType(EntityDataType dataType) {
		this.dataType = dataType;
	}

	public boolean isSupportsPaging() {
		return supportsPaging;
	}

	public void setSupportsPaging(boolean supportsPaging) {
		this.supportsPaging = supportsPaging;
	}

	public Boolean getAutoCreateColumns() {
		return autoCreateColumns;
	}

	public void setAutoCreateColumns(Boolean autoCreateColumns) {
		this.autoCreateColumns = autoCreateColumns;
	}

	@ClientProperty(escapeValue = "clientSide")
	public FilterMode getFilterMode() {
		return filterMode;
	}

	public void setFilterMode(FilterMode filterMode) {
		this.filterMode = filterMode;
	}

	@ClientProperty(escapeValue = "clientSide")
	public SortMode getSortMode() {
		return sortMode;
	}

	public void setSortMode(SortMode sortMode) {
		this.sortMode = sortMode;
	}

	public String getRowSelectionProperty() {
		return rowSelectionProperty;
	}

	public void setRowSelectionProperty(String rowSelectionProperty) {
		this.rowSelectionProperty = rowSelectionProperty;
	}
}
