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

package com.bstek.dorado.data.config.definition;

import java.lang.reflect.Method;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.common.Identifiable;
import com.bstek.dorado.common.MetaDataSupport;
import com.bstek.dorado.common.Namable;
import com.bstek.dorado.config.definition.CreationContext;
import com.bstek.dorado.config.definition.ObjectDefinition;
import com.bstek.dorado.config.xml.XmlConstants;
import com.bstek.dorado.core.bean.BeanFactoryUtils;
import com.bstek.dorado.data.listener.GenericObjectListener;
import com.bstek.dorado.data.method.MethodAutoMatchingUtils;
import com.bstek.dorado.util.PathUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-7-10
 */
public class ListenableObjectDefinition extends GenericObjectDefinition {
	private String listener;

	public String getListener() {
		return listener;
	}

	public void setListener(String listener) {
		this.listener = listener;
	}

	@Override
	protected void initCreationInfo(CreationInfo creationInfo,
			ObjectDefinition definition, boolean processConstrInfos)
			throws Exception {
		super.initCreationInfo(creationInfo, definition, processConstrInfos);
		ListenableObjectDefinition dataObjectDefinition = (ListenableObjectDefinition) definition;
		creationInfo
				.setUserData("listener", dataObjectDefinition.getListener());
	}

	@Override
	protected final void initObject(Object object, CreationInfo creationInfo,
			CreationContext context) throws Exception {
		preinitObject(object, creationInfo, context);

		String listener = getListener();
		if (invokeBeforeInitListener(object, listener, context)) {
			doInitObject(object, creationInfo, context);
			invokeOnInitListener(object, listener, context);
		}
	}

	@SuppressWarnings("unchecked")
	protected void preinitObject(Object object, CreationInfo creationInfo,
			CreationContext context) throws Exception {
		Map<String, Object> properties = creationInfo.getProperties();
		if (object instanceof Namable) {
			String name;
			if (this instanceof Namable) {
				name = ((Namable) this).getName();
			} else {
				name = (String) properties.remove(XmlConstants.ATTRIBUTE_NAME);
			}
			if (StringUtils.isNotEmpty(name)) {
				((Namable) object).setName(name);
			}
		}

		if (object instanceof Identifiable) {
			String id;
			if (this instanceof Identifiable) {
				id = ((Identifiable) this).getId();
			} else {
				id = (String) properties.remove(XmlConstants.ATTRIBUTE_ID);
			}
			if (StringUtils.isNotEmpty(id)) {
				((Identifiable) object).setId(id);
			}
		}

		if (object instanceof MetaDataSupport) {
			Object metaDataDef = properties.remove("metaData");
			metaDataDef = getFinalValueOrExpression(metaDataDef, context);
			if (metaDataDef instanceof Map) {
				Map<String, Object> metaData = (Map<String, Object>) metaDataDef;
				((MetaDataSupport) object).setMetaData(metaData);
			}
		}
	}

	protected void doInitObject(Object object, CreationInfo creationInfo,
			CreationContext context) throws Exception {
		super.initObject(object, creationInfo, context);
	}

	protected boolean filterGlobalListener(GenericObjectListener<?> listener,
			Object object) {
		boolean accept = true;
		Class<?> parameterizedType = listener.getParameterizedType();
		if (parameterizedType != null) {
			accept = parameterizedType.isInstance(object);
		}

		String pattern = listener.getPattern();
		if (accept && StringUtils.isNotEmpty(pattern)) {
			if (object instanceof Namable) {
				accept = PathUtils.match(pattern, ((Namable) object).getName());
				String excludePattern = listener.getExcludePattern();
				if (accept && StringUtils.isNotEmpty(excludePattern)) {
					accept = !PathUtils.match(excludePattern,
							((Namable) object).getName());
				}
			} else if (object instanceof Identifiable) {
				accept = PathUtils.match(pattern,
						((Identifiable) object).getId());
				String excludePattern = listener.getExcludePattern();
				if (accept && StringUtils.isNotEmpty(excludePattern)) {
					accept = !PathUtils.match(excludePattern,
							((Identifiable) object).getId());
				}
			}
		}
		return accept;
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	private boolean invokeBeforeInitListener(Object object, String listeners,
			CreationContext context) throws Exception {
		boolean retval = true;
		// notify global listeners
		for (GenericObjectListener listener : GenericObjectListenerRegistry
				.getListeners()) {
			if (filterGlobalListener(listener, object)) {
				retval = listener.beforeInit(object);
				if (!retval) {
					break;
				}
			}
		}

		if (retval) {
			// notify private listeners
			retval = invokePrivateListeners(object, listeners, context, true);
		}
		return retval;
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	private void invokeOnInitListener(Object object, String listeners,
			CreationContext context) throws Exception {
		// notify global listeners
		for (GenericObjectListener listener : GenericObjectListenerRegistry
				.getListeners()) {
			if (filterGlobalListener(listener, object)) {
				listener.onInit(object);
			}
		}

		// notify private listeners
		invokePrivateListeners(object, listeners, context, false);
	}

	protected boolean invokePrivateListeners(Object object, String listeners,
			CreationContext context, boolean isBeforeListener) throws Exception {
		boolean retval = true;
		if (StringUtils.isNotEmpty(listeners)) {
			for (String listenerExpression : StringUtils.split(listeners, ",")) {
				String listenerName, methodName;
				int i = listenerExpression.lastIndexOf("#");
				if (i > 0) {
					listenerName = listenerExpression.substring(0, i);
					methodName = listenerExpression.substring(i + 1);
				} else {
					listenerName = listenerExpression;
					methodName = null;
				}

				if (StringUtils.isEmpty(methodName)) {
					throw new IllegalArgumentException("The methodName of \""
							+ listenerName + "\" is undefined.");
				}

				boolean isNameStartsWithBefore = methodName
						.startsWith("before");
				if (isBeforeListener == isNameStartsWithBefore) {
					if (!invokePrivateListener(object, listenerName, methodName, context)) {
						retval = false;
						break;
					}
				}
			}
		}
		return retval;
	}

	protected boolean invokePrivateListener(Object object, String listenerName,
			String methodName, CreationContext context) throws Exception {
		Object interceptor = BeanFactoryUtils.getBean(listenerName);
		Method[] methods = MethodAutoMatchingUtils.getMethodsByName(
				interceptor.getClass(), methodName);
		if (methods.length == 0) {
			return true;
		}

		Class<?>[] requiredTypes = null;
		Object[] requiredArgs = null;
		Class<?>[] exactTypes = null;
		Object[] exactArgs = null;
		Class<?>[] optionalTypes = new Class<?>[] { object.getClass() };
		Object[] optionalArgs = new Object[] { object };
		Class<?> returnType = void.class;
		Object retval = MethodAutoMatchingUtils.invokeMethod(methods,
				interceptor, requiredTypes, requiredArgs, exactTypes,
				exactArgs, optionalTypes, optionalArgs, returnType);
		if (retval instanceof Boolean) {
			return ((Boolean) retval).booleanValue();
		} else {
			return true;
		}
	}
}
