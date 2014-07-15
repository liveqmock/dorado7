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

package com.bstek.dorado.view;

import java.io.Writer;
import java.util.Set;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.data.variant.VariantUtils;
import com.bstek.dorado.view.output.ClientOutputHelper;
import com.bstek.dorado.view.output.OutputContext;
import com.bstek.dorado.web.DoradoContext;
import com.bstek.dorado.web.WebConfigure;

/**
 * 顶层视图对象的输出器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Nov 5, 2008
 */
public class TopViewOutputter extends ViewOutputter {
	private ClientOutputHelper clientOutputHelper;

	public void setClientOutputHelper(ClientOutputHelper clientOutputHelper) {
		this.clientOutputHelper = clientOutputHelper;
	}

	@Override
	public void output(Object object, OutputContext context) throws Exception {
		View view = (View) object;
		if (StringUtils.isEmpty(view.getId())) {
			view.setId("viewMain");
		}

		context.addDependsPackage("widget");

		DoradoContext doradoContext = DoradoContext.getCurrent();
		int currentClientType = VariantUtils.toInt(doradoContext
				.getAttribute(ClientType.CURRENT_CLIENT_TYPE_KEY));
		if ((currentClientType == 0 || ClientType.supports(currentClientType,
				ClientType.DESKTOP))
				&& WebConfigure.getBoolean("view.debugEnabled")) {
			context.addDependsPackage("debugger");
		}

		Writer writer = context.getWriter();
		writer.append("dorado.onInit(function(){\n");
		writer.append("try{\n");

		ViewOutputter outputter = (ViewOutputter) clientOutputHelper
				.getOutputter(view.getClass());
		outputter.outputView(view, context);

		writer.append("view.set(\"renderOn\",\"#doradoView\");\n");

		ViewRenderMode renderMode = view.getRenderMode();
		if (renderMode == ViewRenderMode.onCreate) {
			writer.append("view.render();\n");
		} 
		else if (renderMode == ViewRenderMode.onDataLoaded) {
			writer.append("view.loadData();\n");
		}

		writer.append("}\n").append("catch(e){")
				.append("dorado.Exception.processException(e);}\n");
		writer.append("});\n");
		
		context.addDependsPackage("common");

		Set<String> dependsPackages = context.getDependsPackages();
		if (dependsPackages != null && !dependsPackages.isEmpty()) {
			writer.append("$import(\"")
					.append(StringUtils.join(dependsPackages, ','))
					.append("\");\n");
		}
	}
}
