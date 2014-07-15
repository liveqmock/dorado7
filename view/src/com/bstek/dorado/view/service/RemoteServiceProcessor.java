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
import java.util.List;

import org.codehaus.jackson.node.ObjectNode;
import org.codehaus.jackson.type.TypeReference;

import com.bstek.dorado.core.Configure;
import com.bstek.dorado.data.JsonUtils;
import com.bstek.dorado.data.ParameterWrapper;
import com.bstek.dorado.data.variant.MetaData;
import com.bstek.dorado.util.Assert;
import com.bstek.dorado.view.output.OutputContext;
import com.bstek.dorado.web.DoradoContext;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-11-30
 */
public class RemoteServiceProcessor extends AbstractRemoteServiceProcessor {
	@Override
	protected void doExecute(Writer writer, ObjectNode objectNode,
			DoradoContext context) throws Exception {
		String serviceName = JsonUtils.getString(objectNode, "service");
		Assert.notEmpty(serviceName);

		Object parameter = jsonToJavaObject(objectNode.get("parameter"), null,
				null, false);
		MetaData sysParameter = (MetaData) jsonToJavaObject(
				objectNode.get("sysParameter"), null, null, false);

		if (sysParameter != null && !sysParameter.isEmpty()) {
			parameter = new ParameterWrapper(parameter, sysParameter);
		}

		Object returnValue = invokeRemoteService(writer, context, serviceName,
				parameter, null, null, null);

		boolean supportsEntity = JsonUtils.getBoolean(objectNode,
				"supportsEntity");
		OutputContext outputContext = new OutputContext(writer);
		if (supportsEntity) {
			List<String> loadedDataTypes = JsonUtils.get(objectNode,
					"loadedDataTypes", new TypeReference<List<String>>() {
					});

			outputContext.setLoadedDataTypes(loadedDataTypes);
		}
		outputContext.setUsePrettyJson(Configure
				.getBoolean("view.outputPrettyJson"));
		outputContext.setShouldOutputDataTypes(supportsEntity);

		outputResult(returnValue, outputContext);
	}
}
