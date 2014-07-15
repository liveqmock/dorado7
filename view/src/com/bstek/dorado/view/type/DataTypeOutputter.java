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

package com.bstek.dorado.view.type;


import com.bstek.dorado.data.type.AggregationDataType;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.data.type.EntityDataType;
import com.bstek.dorado.view.output.OutputContext;
import com.bstek.dorado.view.output.Outputter;

/**
 * 数据类型的输出器。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Oct 6, 2008
 */
public class DataTypeOutputter implements Outputter {

	private Outputter entityDataTypeOutputter;
	private Outputter aggregationDataTypeOutputter;

	public void setEntityDataTypeOutputter(Outputter entityDataTypeOutputter) {
		this.entityDataTypeOutputter = entityDataTypeOutputter;
	}

	public void setAggregationDataTypeOutputter(
			Outputter aggregationDataTypeOutputter) {
		this.aggregationDataTypeOutputter = aggregationDataTypeOutputter;
	}

	private void throwUnsupportedDataTypeException(Object object) {
		throw new IllegalArgumentException("Unsupported DataType ["
				+ object.getClass() + "].");
	}

	public void output(Object object, OutputContext context) throws Exception {
		if (object == null) return;

		if (object instanceof EntityDataType) {
			entityDataTypeOutputter.output(object, context);
		}
		else if (object instanceof AggregationDataType) {
			AggregationDataType dataType = (AggregationDataType) object;
			DataType elementDataType = dataType.getElementDataType();
			if (elementDataType != null) {
				if (!(elementDataType instanceof EntityDataType)) {
					throwUnsupportedDataTypeException(object);
				}
			}
			aggregationDataTypeOutputter.output(dataType, context);
		}
		else {
			throwUnsupportedDataTypeException(object);
		}
	}

}
