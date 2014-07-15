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

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-9-22
 */
@ClientEvents({ @ClientEvent(name = "onGetBindingData"),
		@ClientEvent(name = "onGetBindingDataType") })
public interface DataControl {

	/**
	 * @return the dataSet
	 */
	public String getDataSet();

	/**
	 * @param dataSet
	 *            the dataSet to set
	 */
	public void setDataSet(String dataSet);

	/**
	 * @return the dataPath
	 */
	public String getDataPath();

	/**
	 * @param dataPath
	 *            the dataPath to set
	 */
	public void setDataPath(String dataPath);
}
