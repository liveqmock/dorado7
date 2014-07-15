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

package com.bstek.dorado.view.widget.data;

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.data.provider.DataProvider;
import com.bstek.dorado.data.provider.PagingList;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.Component;

/**
 * 数据集。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jan 19, 2008
 */
@Widget(name = "DataSet", category = "General", dependsPackage = "widget", autoGenerateId = true)
@XmlNode(nodeName = "DataSet", definitionType = "com.bstek.dorado.view.config.definition.DataSetDefinition", parser = "spring:dorado.dataSetParser", clientTypes = {
		ClientType.DESKTOP, ClientType.TOUCH })
@ClientObject(prototype = "dorado.widget.DataSet", shortTypeName = "DataSet", properties = @ClientProperty(propertyName = "data", outputter = "spring:dorado.dataSetDataPropertyOutputter"))
@ClientEvents({ @ClientEvent(name = "beforeLoadData"),
		@ClientEvent(name = "onLoadData"),
		@ClientEvent(name = "onDataLoad", deprecated = true) })
public class DataSet extends Component {
	private DataType dataType;
	private DataProvider dataProvider;
	private int pageSize;
	private Object parameter;
	private LoadMode loadMode = LoadMode.lazy;
	private boolean readOnly;
	private boolean cacheable;
	private Object data;

	/**
	 * 返回装载数据时使用的分页大小，即按照每页多少条记录来进行分页装载。
	 */
	public int getPageSize() {
		return pageSize;
	}

	/**
	 * 设置装载数据时使用的分页大小。
	 */
	public void setPageSize(int pageSize) {
		this.pageSize = pageSize;
	}

	/**
	 * 返回装载数据时使用的参数，及传递给数据提供器的参数。
	 */
	@XmlProperty
	@ClientProperty(outputter = "spring:dorado.doradoMapPropertyOutputter")
	@IdeProperty(editor = "any", highlight = 1)
	public Object getParameter() {
		return parameter;
	}

	/**
	 * 设置装载数据时使用的参数。
	 */
	public void setParameter(Object parameter) {
		this.parameter = parameter;
	}

	/**
	 * 返回被封装数据的数据类型。
	 */
	@XmlProperty(ignored = true)
	@ClientProperty
	@IdeProperty(highlight = 1)
	public DataType getDataType() {
		return dataType;
	}

	/**
	 * 设置被封装数据的数据类型。
	 */
	public void setDataType(DataType dataType) {
		this.dataType = dataType;
	}

	/**
	 * 返回数据集对应的数据提供器。
	 */
	@XmlProperty(ignored = true)
	@ClientProperty(outputter = "spring:dorado.dataProviderPropertyOutputter")
	@IdeProperty(highlight = 1)
	public DataProvider getDataProvider() {
		return dataProvider;
	}

	/**
	 * 设置数据集对应的数据提供器。
	 */
	public void setDataProvider(DataProvider dataProvider) {
		this.dataProvider = dataProvider;
	}

	/**
	 * @return the loadMode
	 */
	@ClientProperty(escapeValue = "lazy")
	public LoadMode getLoadMode() {
		return loadMode;
	}

	/**
	 * @param loadMode
	 *            the loadMode to set
	 */
	public void setLoadMode(LoadMode loadMode) {
		this.loadMode = loadMode;
	}

	public boolean isReadOnly() {
		return readOnly;
	}

	public void setReadOnly(boolean readOnly) {
		this.readOnly = readOnly;
	}

	public boolean isCacheable() {
		return cacheable;
	}

	public void setCacheable(boolean cacheable) {
		this.cacheable = cacheable;
	}

	public Object getData() throws Exception {
		return getData(true);
	}

	@SuppressWarnings("rawtypes")
	public Object getData(boolean autoLoad) throws Exception {
		if (autoLoad && data == null && dataProvider != null) {
			if (pageSize > 0) {
				data = new PagingList(dataProvider, dataType, parameter,
						pageSize);
			} else {
				data = dataProvider.getResult(parameter, dataType);
			}
		}
		return data;
	}

	public void setData(Object data) {
		this.data = data;
		if (data != null && loadMode != LoadMode.preload) {
			setLoadMode(LoadMode.preload);
		}
	}

	@Deprecated
	public void clearData() {
		data = null;
	}

}
