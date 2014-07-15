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
import java.util.Map;

import org.apache.commons.jexl2.JexlContext;
import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.config.definition.Definition;
import com.bstek.dorado.core.el.ExpressionHandler;
import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.util.proxy.BeanExtender;
import com.bstek.dorado.view.config.attachment.AttachedResourceManager;
import com.bstek.dorado.view.config.attachment.JavaScriptContent;
import com.bstek.dorado.view.config.definition.ViewConfigDefinition;
import com.bstek.dorado.view.manager.ViewConfig;
import com.bstek.dorado.view.output.OutputContext;
import com.bstek.dorado.view.output.Outputter;
import com.bstek.dorado.view.widget.ContainerOutputter;
import com.bstek.dorado.web.DoradoContext;
import com.bstek.dorado.web.DoradoContextUtils;

/**
 * 视图对象的输出器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Sep 19, 2008
 */
public class ViewOutputter extends ContainerOutputter {
	protected Outputter childrenComponentOutputter;
	protected Outputter viewDataTypesOutputter;
	private AttachedResourceManager javaScriptResourceManager;
	private AttachedResourceManager styleSheetResourceManager;

	public void setChildrenComponentOutputter(
			Outputter childrenComponentOutputter) {
		this.childrenComponentOutputter = childrenComponentOutputter;
	}

	public void setViewDataTypesOutputter(Outputter viewDataTypesOutputter) {
		this.viewDataTypesOutputter = viewDataTypesOutputter;
	}

	public void setJavaScriptResourceManager(
			AttachedResourceManager javaScriptResourceManager) {
		this.javaScriptResourceManager = javaScriptResourceManager;
	}

	public void setStyleSheetResourceManager(
			AttachedResourceManager styleSheetResourceManager) {
		this.styleSheetResourceManager = styleSheetResourceManager;
	}

	public ViewOutputter() {
		setUsePrototype(true);
	}

	public void outputView(View view, OutputContext context) throws Exception {
		View originalView = context.getCurrentView();
		context.setCurrentView(view);

		DoradoContext doradoContext = DoradoContext.getCurrent();

		JexlContext jexlContext = null;
		Definition resourceRelativeDefinition = null;
		ViewConfig viewConfig = view.getViewConfig();
		if (viewConfig != null) {
			Map<String, Object> viewContext = DoradoContextUtils
					.getViewContextByBindingObject(doradoContext, viewConfig);
			DoradoContextUtils.pushNewViewContext(doradoContext, viewContext);

			ViewConfigDefinition viewConfigDefinition = (ViewConfigDefinition) BeanExtender
					.getExProperty(viewConfig, "viewConfigDefinition");
			if (viewConfigDefinition != null) {
				ExpressionHandler expressionHandler = (ExpressionHandler) doradoContext
						.getServiceBean("expressionHandler");
				jexlContext = expressionHandler.getJexlContext();
				resourceRelativeDefinition = (Definition) jexlContext
						.get(ViewConfigDefinition.RESOURCE_RELATIVE_DEFINITION);
				jexlContext.set(
						ViewConfigDefinition.RESOURCE_RELATIVE_DEFINITION,
						viewConfigDefinition);
			}
		}

		Writer writer = context.getWriter();
		context.createJsonBuilder();
		try {
			writer.append("var view=");
			super.output(view, context);
			writer.append(";\n");

			writer.append("function f(view){").append("view.set(\"children\",");
			childrenComponentOutputter.output(view.getChildren(), context);
			writer.append(");");

			String javaScriptFiles = view.getJavaScriptFile();
			if (StringUtils.isNotEmpty(javaScriptFiles)) {
				for (String file : StringUtils.split(javaScriptFiles, ";,")) {
					if (StringUtils.isNotEmpty(file)) {
						Resource resource = doradoContext.getResource(file);
						JavaScriptContent content = (JavaScriptContent) javaScriptResourceManager
								.getContent(resource);
						if (content.getIsController()) {
							javaScriptResourceManager.outputContent(context,
									content);
						} else {
							context.addJavaScriptContent(content);
						}
					}
				}
			}

			String styleSheetFiles = view.getStyleSheetFile();
			if (StringUtils.isNotEmpty(styleSheetFiles)) {
				for (String file : StringUtils.split(styleSheetFiles, ",;")) {
					if (StringUtils.isNotEmpty(file)) {
						Resource resource = doradoContext.getResource(file);
						Object content = styleSheetResourceManager
								.getContent(resource);
						context.addStyleSheetContent(content);
					}
				}
			}

			writer.append("}\n");

			// 输出DataType
			outputIncludeDataTypes(view, context);

			String exPackages = view.getPackages();
			if (StringUtils.isNotEmpty(exPackages)) {
				for (String pkg : StringUtils.split(exPackages, ",;")) {
					if (StringUtils.isNotEmpty(pkg)) {
						context.addDependsPackage(pkg);
					}
				}
			}

			writer.append("f(view);\n");
		} finally {
			context.restoreJsonBuilder();
			context.setCurrentView(originalView);

			if (jexlContext != null) {
				jexlContext.set(
						ViewConfigDefinition.RESOURCE_RELATIVE_DEFINITION,
						resourceRelativeDefinition);
			}

			if (viewConfig != null) {
				DoradoContextUtils.popViewContext(doradoContext);
			}
		}
	}

	@Override
	public void output(Object object, OutputContext context) throws Exception {
		Writer writer = context.getWriter();
		writer.append("(function(){\n");
		outputView((View) object, context);
		writer.append("return view;\n").append("})()");
	}

	/**
	 * 输出客户端需要的DataType
	 */
	protected void outputIncludeDataTypes(View view, OutputContext context)
			throws Exception {
		Writer writer = context.getWriter();
		writer.write("view.get(\"dataTypeRepository\").parseJsonData(");
		viewDataTypesOutputter.output(view, context);
		writer.write(");\n");
	}
}
