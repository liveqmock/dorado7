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

package com.bstek.dorado.web;

import java.util.Hashtable;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import com.bstek.dorado.core.bean.Scope;
import com.bstek.dorado.core.bean.ScopeManager;
import com.bstek.dorado.web.DoradoContext;

/**
 * 用于对Web应用中各种对象进行生命周期管理的管理器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 26, 2008
 */
public class WebScopeManager extends ScopeManager {
	private static final String ATTRIBUTE = "$ScopeManager";

	private HttpServletRequest getAttachedRequest() {
		HttpServletRequest request = DoradoContext.getAttachedRequest();
		if (request == null) {
			throw new IllegalStateException(
					"Can not get attached HttpServletRequest, current thread may not be a request thread.");
		}
		return request;
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> getRequestContext() {
		HttpServletRequest request = getAttachedRequest();
		Map<String, Object> map = (Map<String, Object>) request
				.getAttribute(ATTRIBUTE);
		if (map == null) {
			map = new Hashtable<String, Object>();
			request.setAttribute(ATTRIBUTE, map);
		}
		return map;
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> getSessionContext() {
		HttpServletRequest request = getAttachedRequest();
		HttpSession session = request.getSession();
		Map<String, Object> map = (Map<String, Object>) session
				.getAttribute(ATTRIBUTE);
		if (map == null) {
			map = new Hashtable<String, Object>();
			session.setAttribute(ATTRIBUTE, map);
		}
		return map;
	}

	@Override
	public Object getBean(Scope scope, String key) {
		if (Scope.request.equals(scope)) {
			return getRequestContext().get(key);
		} else if (Scope.session.equals(scope)) {
			return getSessionContext().get(key);
		} else {
			return super.getBean(scope, key);
		}
	}

	@Override
	public void putBean(Scope scope, String key, Object bean) {
		if (Scope.request.equals(scope)) {
			getRequestContext().put(key, bean);
		} else if (Scope.session.equals(scope)) {
			getSessionContext().put(key, bean);
		} else {
			super.putBean(scope, key, bean);
		}
	}

	@Override
	public Object removeBean(Scope scope, String key) {
		if (Scope.request.equals(scope)) {
			return getRequestContext().remove(key);
		} else if (Scope.session.equals(scope)) {
			return getSessionContext().remove(key);
		} else {
			return super.removeBean(scope, key);
		}
	}

	@Override
	public void clear(Scope scope) {
		if (Scope.request.equals(scope)) {
			getRequestContext().clear();
		} else if (Scope.session.equals(scope)) {
			getSessionContext().clear();
		} else {
			super.clear(scope);
		}
	}
}
