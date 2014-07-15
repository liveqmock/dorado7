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

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Properties;

import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.jexl2.JexlContext;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.reflect.MethodUtils;

import com.bstek.dorado.annotation.ResourceInjection;
import com.bstek.dorado.common.Namable;
import com.bstek.dorado.config.definition.CreationContext;
import com.bstek.dorado.config.definition.Definition;
import com.bstek.dorado.config.definition.DefinitionUtils;
import com.bstek.dorado.config.definition.ObjectDefinition;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.bean.Scope;
import com.bstek.dorado.core.el.ExpressionHandler;
import com.bstek.dorado.data.Constants;
import com.bstek.dorado.data.config.DataTypeName;
import com.bstek.dorado.data.config.xml.DataXmlConstants;
import com.bstek.dorado.data.resource.ModelResourceBundle;
import com.bstek.dorado.data.resource.ModelResourceManager;
import com.bstek.dorado.data.type.AggregationDataType;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.data.type.EntityDataType;
import com.bstek.dorado.data.type.RudeDataType;
import com.bstek.dorado.data.type.property.PropertyDef;
import com.bstek.dorado.util.CloneUtils;

/**
 * DataType的配置声明对象。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 8, 2008
 * @see com.bstek.dorado.data.type.DataType
 */
public class DataTypeDefinition extends ListenableObjectDefinition implements
		Namable {
	private static final String[] DEFAULT_PROPERTIES = new String[] {
			"caption", "label", "title" };
	private static final String SELF_AGGREGATION_DATA_TYPE_SCTION = '[' + PropertyDef.SELF_DATA_TYPE_NAME + ']';
	private static final String RESOURCE_RELATIVE_DEFINITION = "resourceRelativeDefinition";

	private String name;
	private String id;
	private Class<?> matchType;
	private Class<?> creationType;
	private boolean global;
	private Map<String, PropertyDefDefinition> propertyDefs;
	private boolean isAggregationType;

	private DataType cachedInstance;

	public DataTypeDefinition() {
		setScope(Scope.thread);
	}

	@Override
	public void setCacheCreatedObject(boolean cacheCreatedObject) {
		throw new UnsupportedOperationException();
	}

	public DataTypeDefinition(String name) {
		setName(name);
	}

	/**
	 * 返回DataType的名称。
	 */
	public String getName() {
		return name;
	}

	/**
	 * 设置DataType的名称。
	 */
	public void setName(String name) {
		this.name = name;
		if (StringUtils.isNotEmpty(name)) {
			if (StringUtils.isEmpty(getBeanId())) {
				setBeanId(Constants.SCOPE_DATA_TYPE_PREFIX + name);
			}

			DataTypeName dataTypeName = new DataTypeName(name);
			isAggregationType = (dataTypeName.getSubDataTypes().length == 1);
		}
	}

	public String getId() {
		return id;
	}

	void setId(String id) {
		this.id = id;
	}

	public boolean isAggregationType() {
		return isAggregationType;
	}

	/**
	 * 返回DataType的相匹配类型。
	 */
	public Class<?> getMatchType() {
		return matchType;
	}

	/**
	 * 设置DataType的相匹配类型。
	 */
	public void setMatchType(Class<?> matchType) {
		this.matchType = matchType;
	}

	/**
	 * 返回DataType的相匹配的可实例化类型。
	 */
	public Class<?> getCreationType() {
		return creationType;
	}

	/**
	 * 返回DataType的相匹配的可实例化类型。
	 */
	public void setCreationType(Class<?> creationType) {
		this.creationType = creationType;
	}

	public boolean isGlobal() {
		return global;
	}

	/**
	 * 设置该DataType是否是一个全局对象。
	 */
	@Deprecated
	public void setGlobal(boolean global) {
		this.global = global;
	}

	/**
	 * 向DataType的声明中添加一个属性声明对象。
	 * 
	 * @param name
	 *            属性声明的名称
	 * @param propertyDef
	 *            要添加的属性声明对象
	 */
	public void addPropertyDef(PropertyDefDefinition propertyDef) {
		if (propertyDefs == null) {
			propertyDefs = new LinkedHashMap<String, PropertyDefDefinition>();
		}
		propertyDefs.put(propertyDef.getName(), propertyDef);
	}

	@Deprecated
	public void addPropertyDef(String name, PropertyDefDefinition propertyDef) {
		if (propertyDefs == null) {
			propertyDefs = new LinkedHashMap<String, PropertyDefDefinition>();
		}
		propertyDefs.put(name, propertyDef);
	}

	/**
	 * 根据名称返回一个属性声明对象。
	 * 
	 * @param name
	 *            属性声明的名称
	 * @return 相应的属性声明对象
	 */
	public PropertyDefDefinition getPropertyDef(String name) {
		if (propertyDefs != null) {
			return propertyDefs.get(name);
		} else {
			return null;
		}
	}

	/**
	 * 返回DataType声明中所有的属性声明对象的Map集合。<br>
	 * 其中Map集合的键为属性声明的名称，值为相应的属性声明对象。
	 */
	public Map<String, PropertyDefDefinition> getPropertyDefs() {
		return propertyDefs;
	}

	@Override
	protected Object doCreate(CreationContext context, Object[] constructorArgs)
			throws Exception {
		if (global) {
			DataType dataType = cachedInstance;
			if (dataType != null) {
				return dataType;
			}

			dataType = (DataType) super.doCreate(context, constructorArgs);
			if (!(dataType instanceof EntityDataType || dataType instanceof AggregationDataType)) {
				cachedInstance = dataType;
			}
			return dataType;
		} else {
			return super.doCreate(context, constructorArgs);
		}
	}

	protected ExpressionHandler getExpressionHandler(Context doradoContext)
			throws Exception {
		return (ExpressionHandler) doradoContext
				.getServiceBean("expressionHandler");
	}

	private void injectResourceStrings(DataTypeDefinition dataTypeDefinition,
			EntityDataType dataType) throws Exception {
		Context doradoContext = Context.getCurrent();
		ModelResourceManager modelResourceManager = (ModelResourceManager) doradoContext
				.getServiceBean("modelResourceManager");
		ModelResourceBundle bundle = (ModelResourceBundle) modelResourceManager
				.getBundle(dataTypeDefinition);
		if (bundle == null) {
			return;
		}

		Properties strings = bundle.getSubProperties(dataTypeDefinition
				.getName());
		if (strings == null) {
			return;
		}

		for (Map.Entry<Object, Object> entry : strings.entrySet()) {
			injectResourceString(dataType, (String) entry.getKey(),
					(String) entry.getValue());
		}
	}

	protected void injectResourceString(EntityDataType dataType, String key,
			String resourceString) throws Exception {
		Object object = dataType;
		ResourceInjection resourceInjection = object.getClass().getAnnotation(
				ResourceInjection.class);

		String[] sections = StringUtils.split(key, ".");
		int len = sections.length;
		for (int i = 0; i < len; i++) {
			String section = sections[i];
			boolean isObject = section.charAt(0) == '#';

			if (isObject) {
				section = section.substring(1);

				if (resourceInjection == null) {
					throwInvalidResourceKey(key);
				}
				String methodName = resourceInjection.subObjectMethod();
				if (StringUtils.isEmpty(methodName)) {
					throwInvalidResourceKey(key);
				}
				object = MethodUtils.invokeExactMethod(object, methodName,
						new String[] { section });
				if (object == null) {
					break;
				}
				resourceInjection = object.getClass().getAnnotation(
						ResourceInjection.class);

				if (i == len - 1) {
					String[] defaultProperties;
					if (resourceInjection == null) {
						defaultProperties = DEFAULT_PROPERTIES;
					} else {
						defaultProperties = resourceInjection.defaultProperty();
					}

					boolean found = false;
					for (String property : defaultProperties) {
						if (PropertyUtils.isWriteable(object, property)) {
							// if (PropertyUtils.getSimpleProperty(object,
							// property) == null) {
							PropertyUtils.setSimpleProperty(object, property,
									resourceString);
							// }
							found = true;
							break;
						}
					}
					if (!found) {
						throwInvalidResourceKey(key);
					}
				}
			} else {
				if (i == len - 1) {
					if (PropertyUtils.getSimpleProperty(object, section) == null) {
						PropertyUtils.setSimpleProperty(object, section,
								resourceString);
					}
				} else {
					object = PropertyUtils.getSimpleProperty(object, section);
				}
			}
		}
	}

	private void throwInvalidResourceKey(String key) {
		throw new IllegalArgumentException("Invalid resource key \"" + key
				+ "\".");
	}

	@Override
	@SuppressWarnings("unchecked")
	protected void doInitObject(Object object, CreationInfo creationInfo,
			CreationContext context) throws Exception {
		Context doradoContext = Context.getCurrent();
		ExpressionHandler expressionHandler = getExpressionHandler(doradoContext);
		JexlContext jexlContext = expressionHandler.getJexlContext();

		Definition resourceRelativeDefinition = (Definition) jexlContext
				.get(RESOURCE_RELATIVE_DEFINITION);
		jexlContext.set(RESOURCE_RELATIVE_DEFINITION, this);
		try {
			DataType dataType = (DataType) object;

			RudeDataType rudeDataType = (RudeDataType) dataType;
			rudeDataType.setName(name);
			if (StringUtils.isNotEmpty(id)) {
				rudeDataType.setId(id);
			}

			Class<?> matchType = (Class<?>) creationInfo
					.getUserData("matchType");
			if (matchType != null && !Object.class.equals(matchType)) {
				rudeDataType.setMatchType(matchType);
			}

			Class<?> creationType = (Class<?>) creationInfo
					.getUserData("creationType");
			if (creationType != null) {
				rudeDataType.setCreationType(creationType);
			}

			Map<String, PropertyDefDefinition> propertyDefs = (Map<String, PropertyDefDefinition>) creationInfo
					.getUserData("propertyDefs");
			if (propertyDefs != null && !propertyDefs.isEmpty()) {
				if (dataType instanceof EntityDataType) {
					EntityDataType entityDataType = (EntityDataType) dataType;
					for (PropertyDefDefinition definition : propertyDefs
							.values()) {
						Object tempDataType = definition
								.getProperty(DataXmlConstants.ATTRIBUTE_DATA_TYPE);
						if (tempDataType != null
								&& tempDataType instanceof DataTypeDefinitionReference) {
							DataTypeDefinitionReference dataTypeRef = (DataTypeDefinitionReference) tempDataType;
							String nameRef = dataTypeRef.getName();
							if (nameRef.equals(PropertyDef.SELF_DATA_TYPE_NAME)) {
								dataTypeRef.setName(name);
							} else if (nameRef
									.indexOf(SELF_AGGREGATION_DATA_TYPE_SCTION) >= 0) {
								nameRef = nameRef.replace(
										SELF_AGGREGATION_DATA_TYPE_SCTION,
										'[' + name + ']');
								dataTypeRef.setName(nameRef);
							}
						}

						jexlContext.set(RESOURCE_RELATIVE_DEFINITION,
								definition);
						PropertyDef propertyDef = (PropertyDef) DefinitionUtils
								.getRealValue(definition, context);
						entityDataType.addPropertyDef(propertyDef);
						jexlContext.set(RESOURCE_RELATIVE_DEFINITION, this);
					}
				} else {
					throw new IllegalArgumentException(
							"Can not add PropertyDef for DataType [" + name
									+ "].");
				}
			}

			super.doInitObject(dataType, creationInfo, context);

			if (dataType instanceof EntityDataType) {
				EntityDataType entityDataType = ((EntityDataType) dataType);
				if (entityDataType.isAutoCreatePropertyDefs()) {
					entityDataType.createPropertyDefs();
				}

				Definition[] parents = creationInfo.getParents().toArray(
						new Definition[0]);
				for (int i = parents.length - 1; i >= 0; i--) {
					Definition parent = parents[i];
					if (parent instanceof DataTypeDefinition) {
						DataTypeDefinition parentDataType = (DataTypeDefinition) parent;
						if (!parentDataType.isGlobal()
								|| parentDataType.isAggregationType()) {
							continue;
						}

						if (dataType instanceof EntityDataType) {
							injectResourceStrings(parentDataType,
									entityDataType);
						}
					}
				}

				if (isGlobal() && !isAggregationType()) {
					injectResourceStrings(this, entityDataType);
				}
			}
		} finally {
			jexlContext.set(RESOURCE_RELATIVE_DEFINITION,
					resourceRelativeDefinition);
		}
	}

	@Override
	@SuppressWarnings("unchecked")
	protected void initCreationInfo(CreationInfo creationInfo,
			ObjectDefinition definition, boolean processConstrInfos)
			throws Exception {
		super.initCreationInfo(creationInfo, definition, processConstrInfos);
		DataTypeDefinition dataTypeDefinition = (DataTypeDefinition) definition;

		if (processConstrInfos) {
			// process MatchType and CreationType
			Class<?> matchType = dataTypeDefinition.getMatchType();
			if (matchType != null) {
				creationInfo.setUserData("matchType", matchType);
			}
			Class<?> creationType = dataTypeDefinition.getCreationType();
			if (creationType != null) {
				creationInfo.setUserData("creationType", creationType);
			}
		}

		// process PropertyDefs
		if (isAggregationType) {
			return;
		}

		Map<String, ObjectDefinition> allPropertyDefs = (Map<String, ObjectDefinition>) creationInfo
				.getUserData("propertyDefs");
		if (allPropertyDefs == null) {
			allPropertyDefs = new LinkedHashMap<String, ObjectDefinition>();
			creationInfo.setUserData("propertyDefs", allPropertyDefs);
		}

		Map<String, PropertyDefDefinition> propertyDefs = dataTypeDefinition
				.getPropertyDefs();
		if (propertyDefs != null) {
			for (Map.Entry<String, PropertyDefDefinition> entry : propertyDefs
					.entrySet()) {
				String name = entry.getKey();
				PropertyDefDefinition propertyDef = entry.getValue();

				ObjectDefinition parentProperty = allPropertyDefs.get(name);
				if (parentProperty != null) {
					propertyDef = CloneUtils.clone(propertyDef);
					Definition[] originParents = propertyDef.getParents();
					Definition[] parents;
					if (originParents == null) {
						parents = new Definition[] { parentProperty };
					} else {
						parents = new Definition[originParents.length + 1];
						parents[0] = parentProperty;
						System.arraycopy(originParents, 0, parents, 1,
								originParents.length);
					}
					propertyDef.setParents(parents);
				}
				allPropertyDefs.put(name, propertyDef);
			}
		}
	}

	@Override
	protected void setObjectProperty(Object object, String property,
			Object value, CreationContext context) throws Exception {
		try {
			super.setObjectProperty(object, property, value, context);
		} catch (NoSuchMethodException e) {
			if (DataXmlConstants.ATTRIBUTE_ELEMENT_DATA_TYPE.equals(property)
					&& !(object instanceof EntityDataType)) {
				// do nothing
			} else {
				throw e;
			}
		}
	}

}
