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

import java.io.Writer;

import org.springframework.util.StringUtils;

import com.bstek.dorado.data.type.AggregationDataType;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.view.output.JsonBuilder;
import com.bstek.dorado.view.output.ObjectOutputterDispatcher;
import com.bstek.dorado.view.output.OutputContext;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Oct 23, 2008
 */
public class DataTypePropertyOutputter extends ObjectOutputterDispatcher {
	private static final String AUTO = "%AUTO%";

	private boolean useLazyDataType;

	/**
	 * @param useLazyDataType
	 *            the useLazyDataType to set
	 */
	public void setUseLazyDataType(boolean useLazyDataType) {
		this.useLazyDataType = useLazyDataType;
	}

	@Override
	public void output(Object object, OutputContext context) throws Exception {
		DataType dataType = (DataType) object;
		JsonBuilder json = context.getJsonBuilder();
		json.beginValue();
		Writer writer = context.getWriter();

		// if (BeanExtender.getExProperty(dataType, "dorado.dynamicDataType") !=
		// null) {
		// writer.append("dorado.DataTypeRepository.parseSingleDataType(");
		// outputObject(dataType, context);
		// writer.append(")");
		// } else {
		if (useLazyDataType) {
			writer.append("dorado.LazyLoadDataType.create(v.dataTypeRepository,");
		}

		writer.append('"');
		String id = dataType.getId();
		if (dataType instanceof AggregationDataType && id.contains(AUTO)) {
			String[] idSections = StringUtils.split(id, AUTO);
			writer.append(idSections[0])
					.append(((AggregationDataType) dataType)
							.getElementDataType().getId())
					.append(idSections[1]);
		} else {
			writer.append(id);
		}
		writer.append('"');

		if (useLazyDataType) {
			writer.append(")");
		} else {
			if (context.isShouldOutputDataTypes()) {
				if (dataType instanceof AggregationDataType) {
					dataType = ((AggregationDataType) dataType)
							.getElementDataType();
				}
				if (dataType != null) {
					context.markIncludeDataType(dataType);
				}
			}
		}
		// }
		json.endValue();
	}
}
