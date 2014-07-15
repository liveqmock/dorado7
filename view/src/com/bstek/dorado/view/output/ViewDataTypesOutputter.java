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

package com.bstek.dorado.view.output;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.view.View;
import com.bstek.dorado.view.manager.ViewConfig;

/**
 * 用于输出
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Nov 20, 2008
 */
public class ViewDataTypesOutputter extends AbstractDataTypeOutputter {

	@Override
	public void output(Object object, OutputContext context) throws Exception {
		ViewConfig viewConfig = ((View) object).getViewConfig();
		Map<String, DataType> includeDataTypes = context.getIncludeDataTypes();

		int includeDataTypeNum = 0;
		Set<DataType> dataTypes = new HashSet<DataType>();

		if (includeDataTypes != null) {
			includeDataTypeNum = includeDataTypes.size();

			for (Map.Entry<String, DataType> entry : includeDataTypes
					.entrySet()) {
				DataType dataType = entry.getValue();
				DataType outputDataType = getOutputDataType(dataType, context);

				if (outputDataType != null
						&& outputDataType.getId().equals(
								outputDataType.getName())) {
					dataTypes.add(outputDataType);
				}
			}
		}

		for (String dataTypeName : viewConfig.getPrivateDataTypeNames()) {
			DataType dataType = viewConfig.getDataType(dataTypeName);
			DataType outputDataType = getOutputDataType(dataType, context);
			if (outputDataType != null) {
				dataTypes.add(outputDataType);
			}
		}

		JsonBuilder json = context.getJsonBuilder();
		json.array();
		for (DataType dataType : dataTypes) {
			json.beginValue();
			outputObject(dataType, context);
			json.endValue();
		}

		if (includeDataTypes != null) {
			while (includeDataTypeNum < includeDataTypes.size()) {
				dataTypes.clear();

				int i = 0;
				for (Map.Entry<String, DataType> entry : includeDataTypes
						.entrySet()) {
					i++;
					if (i <= includeDataTypeNum) {
						continue;
					}

					DataType dataType = entry.getValue();
					if (!dataTypes.contains(dataType)) {
						DataType outputDataType = getOutputDataType(dataType,
								context);
						if (outputDataType != null
								&& outputDataType.getId().equals(
										outputDataType.getName())) {
							dataTypes.add(outputDataType);
						}
					}
				}
				includeDataTypeNum = includeDataTypes.size();

				for (DataType dataType : dataTypes) {
					json.beginValue();
					outputObject(dataType, context);
					json.endValue();
				}
			}

			includeDataTypes.clear();
		}
		json.endArray();
	}

}
