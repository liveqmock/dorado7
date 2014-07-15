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

package com.bstek.dorado.view.service;

import java.io.Writer;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.codehaus.jackson.node.ArrayNode;
import org.codehaus.jackson.node.ObjectNode;
import org.codehaus.jackson.type.TypeReference;

import com.bstek.dorado.core.Configure;
import com.bstek.dorado.data.JsonUtils;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.view.output.OutputContext;
import com.bstek.dorado.web.DoradoContext;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jul 14, 2009
 */
public class LoadDataTypeServiceProcessor extends DataServiceProcessorSupport {

	@Override
	protected void doExecute(Writer writer, ObjectNode objectNode,
			DoradoContext context) throws Exception {
		ArrayNode rudeDataTypeArray = (ArrayNode) objectNode.get("dataType");
		Collection<String> dataTypeArray = JsonUtils.getObjectMapper()
				.readValue(rudeDataTypeArray,
						new TypeReference<List<String>>() {
						});
		Map<String, DataType> dataTypeMap = new HashMap<String, DataType>();
		if (dataTypeMap != null) {
			for (String dataTypeName : dataTypeArray) {
				dataTypeMap.put(dataTypeName, getDataType(dataTypeName));
			}
		}

		OutputContext outputContext = new OutputContext(writer);
		outputContext.setUsePrettyJson(Configure
				.getBoolean("view.outputPrettyJson"));
		outputDataTypes(dataTypeMap, outputContext);
	}

}
