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

package com.bstek.dorado.view.config.definition;

import java.lang.reflect.Method;

import org.aopalliance.intercept.MethodInterceptor;
import org.apache.commons.jexl2.JexlContext;
import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.common.Identifiable;
import com.bstek.dorado.config.definition.CreationContext;
import com.bstek.dorado.config.definition.Definition;
import com.bstek.dorado.config.definition.DefinitionReference;
import com.bstek.dorado.config.definition.DirectDefinitionReference;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.bean.BeanFactoryUtils;
import com.bstek.dorado.core.bean.BeanWrapper;
import com.bstek.dorado.core.el.ExpressionHandler;
import com.bstek.dorado.data.config.definition.ListenableObjectDefinition;
import com.bstek.dorado.data.method.MethodAutoMatchingException;
import com.bstek.dorado.data.method.MethodAutoMatchingUtils;
import com.bstek.dorado.util.proxy.BeanExtender;
import com.bstek.dorado.util.proxy.BeanExtenderMethodInterceptor;
import com.bstek.dorado.view.View;
import com.bstek.dorado.view.manager.ViewConfig;
import com.bstek.dorado.view.manager.ViewCreationContext;
import com.bstek.dorado.view.registry.AssembledComponentTypeRegisterInfo;
import com.bstek.dorado.view.registry.ComponentTypeRegisterInfo;
import com.bstek.dorado.view.widget.Component;

/**
 * 组件的配置声明对象。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 28, 2008
 */
public class ComponentDefinition extends ListenableObjectDefinition implements
		Identifiable {
	private ComponentTypeRegisterInfo registerInfo;
	private String id;
	private String componentType;
	private ComponentDefinition assembledComponentDefinition;
	private boolean assembledComponentParentInited;

	public ComponentDefinition(ComponentTypeRegisterInfo registerInfo) {
		this.registerInfo = registerInfo;
	}

	public ComponentTypeRegisterInfo getRegisterInfo() {
		return registerInfo;
	}

	/**
	 * 返回组件的id。
	 */
	public String getId() {
		return id;
	}

	/**
	 * 设置返回组件的id。
	 */
	public void setId(String id) {
		this.id = id;
	}

	public String getComponentType() {
		return componentType;
	}

	public void setComponentType(String componentType) {
		this.componentType = componentType;
	}

	public ComponentDefinition getAssembleComponentDefinition() {
		return assembledComponentDefinition;
	}

	public void setAssembleComponentDefinition(
			ComponentDefinition assembleComponentDefinition) {
		this.assembledComponentDefinition = assembleComponentDefinition;
	}

	@Override
	protected BeanWrapper createObject(CreationInfo creationInfo,
			Object[] constructorArgs, MethodInterceptor[] methodInterceptors,
			CreationContext context) throws Exception {
		if (assembledComponentDefinition != null) {
			BeanExtenderMethodInterceptor bemi = new BeanExtenderMethodInterceptor();
			if (methodInterceptors == null) {
				methodInterceptors = new MethodInterceptor[] { bemi };
			} else {
				MethodInterceptor[] newMis = new MethodInterceptor[methodInterceptors.length + 1];
				System.arraycopy(methodInterceptors, 0, newMis, 0,
						methodInterceptors.length);
				newMis[methodInterceptors.length] = bemi;
				methodInterceptors = newMis;
			}
		}

		BeanWrapper wrapper = super.createObject(creationInfo, constructorArgs,
				methodInterceptors, context);
		if (assembledComponentDefinition != null) {
			BeanExtender.setExProperty(wrapper.getBean(),
					"$assembledComponentInfo", registerInfo);
		}
		return wrapper;
	}

	@Override
	@SuppressWarnings({ "unchecked" })
	protected Object doCreate(CreationContext context, Object[] constructorArgs)
			throws Exception {
		JexlContext jexlContext = null;
		AssembledComponentExpressionObject originAcomp = null;
		Object originAssembledComponentVar = null;
		if (assembledComponentDefinition != null) {
			ExpressionHandler expressionHandler = (ExpressionHandler) Context
					.getCurrent().getServiceBean("expressionHandler");
			jexlContext = expressionHandler.getJexlContext();

			originAcomp = (AssembledComponentExpressionObject) jexlContext
					.get("acomp");
			AssembledComponentExpressionObject acomp = new AssembledComponentExpressionObject(
					getProperties());
			jexlContext.set("acomp", acomp);

			String id = getId();
			if (StringUtils.isEmpty(id)) {
				id = acomp.id(assembledComponentDefinition.id);
				setId(id);
			} else {
				acomp.setRealId(assembledComponentDefinition.id, id);
			}

			/* @Deprecated */
			originAssembledComponentVar = jexlContext.get("virtualProperty");
			jexlContext.set("virtualProperty", getProperties());

			if (!assembledComponentParentInited) {
				assembledComponentParentInited = true;

				DefinitionReference<? extends Definition>[] parentReferences = getParentReferences();
				if (parentReferences == null) {
					setParents(new Definition[] { assembledComponentDefinition });
				} else {
					DirectDefinitionReference<ComponentDefinition> definitionReference = new DirectDefinitionReference<ComponentDefinition>(
							assembledComponentDefinition);
					DefinitionReference<? extends Definition>[] newParentReferences = new DefinitionReference[parentReferences.length + 1];
					newParentReferences[0] = definitionReference;
					System.arraycopy(parentReferences, 0, newParentReferences,
							1, parentReferences.length);
					setParentReferences(newParentReferences);
				}
			}
		}
		try {
			return super.doCreate(context, constructorArgs);
		} finally {
			if (assembledComponentDefinition != null) {
				jexlContext.set("acomp", originAcomp);
				jexlContext.set("virtualProperty", originAssembledComponentVar);
			}
		}
	}

	@Override
	protected void doInitObject(Object object, CreationInfo creationInfo,
			CreationContext context) throws Exception {
		if (assembledComponentDefinition != null) {
			for (String property : ((AssembledComponentTypeRegisterInfo) registerInfo)
					.getVirtualProperties().keySet()) {
				Object value = creationInfo.getProperties().remove(property);
				BeanExtender.setExProperty(object, property, value);
			}
		}

		Component component = (Component) object;
		component.setId(id);
		super.doInitObject(object, creationInfo, context);
	}

	@Override
	protected boolean invokePrivateListener(Object object, String listenerName,
			String methodName, CreationContext context) throws Exception {
		Object interceptor = BeanFactoryUtils.getBean(listenerName);
		Method[] methods = MethodAutoMatchingUtils.getMethodsByName(
				interceptor.getClass(), methodName);
		if (methods.length == 0) {
			return true;
		}

		Object retval;
		try {
			Class<?>[] requiredTypes = null;
			Object[] requiredArgs = null;
			Class<?>[] exactTypes = null;
			Object[] exactArgs = null;
			Class<?>[] optionalTypes = new Class<?>[] { object.getClass() };
			Object[] optionalArgs = new Object[] { object };
			Class<?> returnType = void.class;
			retval = MethodAutoMatchingUtils.invokeMethod(methods, interceptor,
					requiredTypes, requiredArgs, exactTypes, exactArgs,
					optionalTypes, optionalArgs, returnType);
		} catch (MethodAutoMatchingException e1) {
			ViewCreationContext viewCreationContext = (ViewCreationContext) context;
			Component component = (Component) object;
			ViewConfig viewConfig = viewCreationContext.getViewConfig();
			View view = viewConfig.getView();

			if (methods.length == 1) {
				Method method = methods[0];
				String[] parameterNames = MethodAutoMatchingUtils
						.getParameterNames(method);
				Class<?>[] parameterTypes = method.getParameterTypes();
				Object[] args = new Object[parameterNames.length];
				for (int i = 0; i < parameterNames.length; i++) {
					String parameterName = parameterNames[i];
					Class<?> parameterType = parameterTypes[i];
					Object arg = null;
					if (Component.class.isAssignableFrom(parameterType)) {
						if ("view".equals(parameterName)) {
							arg = view;
						} else {
							arg = component;
						}
					}
					if (ViewConfig.class.isAssignableFrom(parameterType)) {
						arg = viewConfig;
					}
					args[i] = arg;
				}
				retval = method.invoke(interceptor, args);
			} else {
				throw e1;
			}
		}

		if (retval instanceof Boolean) {
			return ((Boolean) retval).booleanValue();
		} else {
			return true;
		}
	}
}
