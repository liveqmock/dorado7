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

package com.bstek.dorado.view.el;

import java.util.Collection;
import java.util.Map;
import java.util.Set;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.config.definition.Definition;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.el.ExpressionHandler;
import com.bstek.dorado.data.resource.ModelResourceManager;
import com.bstek.dorado.view.config.definition.ViewConfigDefinition;
import com.bstek.dorado.view.resource.ViewResourceManager;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-5-7
 */
public class ResourceExpressionHandler implements Map<String, String> {
	private static final Log logger = LogFactory
			.getLog(ResourceExpressionHandler.class);
	private static final String RESOURCE_RELATIVE_DEFINITION = "resourceRelativeDefinition";

	private static ExpressionHandler expressionHandler;
	private static ModelResourceManager modelResourceManager;
	private static ViewResourceManager viewResourceManager;

	protected static ExpressionHandler getExpressionHandler() throws Exception {
		if (expressionHandler == null) {
			expressionHandler = (ExpressionHandler) Context.getCurrent()
					.getServiceBean("expressionHandler");
		}
		return expressionHandler;
	}

	protected static ModelResourceManager getModelResourceManager()
			throws Exception {
		if (modelResourceManager == null) {
			modelResourceManager = (ModelResourceManager) Context.getCurrent()
					.getServiceBean("modelResourceManager");
		}
		return modelResourceManager;
	}

	protected static ViewResourceManager getViewResourceManager()
			throws Exception {
		if (viewResourceManager == null) {
			viewResourceManager = (ViewResourceManager) Context.getCurrent()
					.getServiceBean("viewResourceManager");
		}
		return viewResourceManager;
	}

	protected String doGet(String path, Object... args) {
		String result = null;
		try {
			Definition definition = (Definition) getExpressionHandler()
					.getJexlContext().get(RESOURCE_RELATIVE_DEFINITION);
			if (definition != null) {
				if (definition instanceof ViewConfigDefinition) {
					result = getViewResourceManager().getString(
							(ViewConfigDefinition) definition, path, args);
				} else {
					result = getModelResourceManager().getString(definition,
							path, args);
				}
			}
		} catch (Exception e) {
			logger.warn(e, e);
		}
		return (result != null) ? result : "";
	}

	public String get(String path, Object... args) {
		return doGet(path, args);
	}

	public String get(Object path) {
		return doGet((String) path);
	}

	public int size() {
		throw new UnsupportedOperationException();
	}

	public boolean isEmpty() {
		throw new UnsupportedOperationException();
	}

	public boolean containsKey(Object key) {
		throw new UnsupportedOperationException();
	}

	public boolean containsValue(Object value) {
		throw new UnsupportedOperationException();
	}

	public String put(String key, String value) {
		throw new UnsupportedOperationException();
	}

	public String remove(Object key) {
		throw new UnsupportedOperationException();
	}

	public void putAll(Map<? extends String, ? extends String> m) {
		throw new UnsupportedOperationException();
	}

	public void clear() {
		throw new UnsupportedOperationException();
	}

	public Set<String> keySet() {
		throw new UnsupportedOperationException();
	}

	public Collection<String> values() {
		throw new UnsupportedOperationException();
	}

	public Set<java.util.Map.Entry<String, String>> entrySet() {
		throw new UnsupportedOperationException();
	}

}
