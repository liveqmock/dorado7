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

import java.io.Writer;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.Stack;

import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.data.variant.VariantUtils;
import com.bstek.dorado.util.Assert;
import com.bstek.dorado.view.View;
import com.bstek.dorado.view.widget.Control;
import com.bstek.dorado.web.DoradoContext;

/**
 * 输出器上下文。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Oct 6, 2008
 */
public class OutputContext {
	private Writer writer;
	private View currentView;
	private Stack<JsonBuilder> jsonBuilders = new Stack<JsonBuilder>();
	private boolean usePrettyJson;
	private boolean shouldOutputDataTypes = true;
	private boolean shouldOutputEntityState;
	private boolean escapeable;
	private Set<String> loadedDataTypes;
	private Map<String, DataType> includeDataTypes;
	private Set<String> dependsPackages;
	private Set<Object> javaScriptContents;
	private Set<Object> styleSheetContents;
	private Stack<Object> dataObjectStack;
	private Map<Control, String> calloutHtmlMap;
	private int calloutSN;

	public OutputContext(Writer writer) {
		this.writer = writer;
	}

	/**
	 * @return
	 */
	public Writer getWriter() {
		return writer;
	}

	public View getCurrentView() {
		return currentView;
	}

	public void setCurrentView(View currentView) {
		this.currentView = currentView;
	}

	/**
	 * @return
	 */
	public JsonBuilder getJsonBuilder() {
		if (jsonBuilders.isEmpty()) {
			return createJsonBuilder();
		} else {
			return jsonBuilders.peek();
		}
	}

	public JsonBuilder createJsonBuilder() {
		JsonBuilder jsonBuilder = new JsonBuilder(getWriter(), true);
		if (usePrettyJson) {
			jsonBuilder.setPrettyFormat(true);
			if (!jsonBuilders.isEmpty()) {
				JsonBuilder parentJsonBuilder = jsonBuilders.peek();
				jsonBuilder.setLeadingTab(parentJsonBuilder.getLeadingTab());
			}
		}
		jsonBuilders.push(jsonBuilder);
		return jsonBuilder;
	}

	public void restoreJsonBuilder() {
		if (!jsonBuilders.isEmpty()) {
			jsonBuilders.pop();
		}
	}

	public boolean isUsePrettyJson() {
		return usePrettyJson;
	}

	public void setUsePrettyJson(boolean usePrettyJson) {
		this.usePrettyJson = usePrettyJson;
	}

	/**
	 * 是否需要向客户端输出DataType的信息。
	 */
	public boolean isShouldOutputDataTypes() {
		return shouldOutputDataTypes;
	}

	/**
	 * 设置是否需要向客户端输出DataType的信息。默认值为true。
	 */
	public void setShouldOutputDataTypes(boolean shouldOutputDataTypes) {
		this.shouldOutputDataTypes = shouldOutputDataTypes;
	}

	/**
	 * @return the shouldOutputEntityState
	 */
	public boolean isShouldOutputEntityState() {
		return shouldOutputEntityState;
	}

	/**
	 * @param shouldOutputEntityState
	 *            the shouldOutputEntityState to set
	 */
	public void setShouldOutputEntityState(boolean shouldOutputEntityState) {
		this.shouldOutputEntityState = shouldOutputEntityState;
	}

	public boolean isEscapeable() {
		return escapeable;
	}

	public void setEscapeable(boolean escapeable) {
		this.escapeable = escapeable;
	}

	public void setLoadedDataTypes(Collection<String> loadedDataTypes) {
		if (loadedDataTypes != null && !(loadedDataTypes instanceof Set<?>)) {
			Collection<String> collection = loadedDataTypes;
			loadedDataTypes = new HashSet<String>();
			for (String dataTypeName : collection) {
				loadedDataTypes.add(dataTypeName);
			}
		}
		this.loadedDataTypes = (Set<String>) loadedDataTypes;
	}

	public boolean isDataTypeLoaded(String dataTypeName) {
		return (loadedDataTypes != null) ? loadedDataTypes
				.contains(dataTypeName) : false;
	}

	/**
	 * 返回客户端需要的DataType的集合。
	 */
	public Map<String, DataType> getIncludeDataTypes() {
		return includeDataTypes;
	}

	/**
	 * 返回客户端需要的DataType的集合。
	 */
	public void markIncludeDataType(DataType dataType) {
		if (includeDataTypes == null) {
			includeDataTypes = new LinkedHashMap<String, DataType>();
		}
		if (!includeDataTypes.containsKey(dataType.getName())) {
			includeDataTypes.put(dataType.getName(), dataType);
		}
	}

	/**
	 * 返回客户端依赖的资源包的集合。
	 */
	public Set<String> getDependsPackages() {
		return (Set<String>) Collections.unmodifiableSet(dependsPackages);
	}

	public void addDependsPackage(String packageName) {
		if (dependsPackages == null) {
			dependsPackages = new LinkedHashSet<String>();
		}

		if ("widget".equals(packageName)) {
			return;
		} else if ("base-widget".equals(packageName)) {
			/*
			 * 这里是一段临时代码，修复下面的BUG
			 * AutoForm依赖base-widget，而事实上trigger特性必须依赖base-widget-desktop或base-
			 * widget-touch才能正常工作。
			 */
			DoradoContext doradoContext = DoradoContext.getCurrent();
			int currentClientType = VariantUtils.toInt(doradoContext
					.getAttribute(ClientType.CURRENT_CLIENT_TYPE_KEY));
			if (currentClientType == 0) {
				currentClientType = ClientType.DESKTOP;
			}
			String clientTypeName = ClientType.toString(currentClientType);

			packageName += ('-' + clientTypeName);
		}
		dependsPackages.add(packageName);
	}

	public Set<Object> getJavaScriptContents() {
		return javaScriptContents;
	}

	public void addJavaScriptContent(Object content) {
		Assert.notNull(content);
		if (javaScriptContents == null) {
			javaScriptContents = new LinkedHashSet<Object>();
		}
		javaScriptContents.add(content);
	}

	public Set<Object> getStyleSheetContents() {
		return styleSheetContents;
	}

	public void addStyleSheetContent(Object content) {
		Assert.notNull(content);
		if (styleSheetContents == null) {
			styleSheetContents = new LinkedHashSet<Object>();
		}
		styleSheetContents.add(content);
	}

	/**
	 * 用于放置对象递归引用导致输出过程死锁的堆栈。
	 */
	public Stack<Object> getDataObjectStack() {
		if (dataObjectStack == null) {
			dataObjectStack = new Stack<Object>();
		}
		return dataObjectStack;
	}

	public Map<Control, String> getCalloutHtmlMap() {
		return calloutHtmlMap;
	}

	public void addCalloutHtml(Control control, String htmlId) {
		if (calloutHtmlMap == null) {
			calloutHtmlMap = new HashMap<Control, String>();
		}
		calloutHtmlMap.put(control, htmlId);
	}

	public String getCalloutId() {
		return String.valueOf(++calloutSN);
	}
}
