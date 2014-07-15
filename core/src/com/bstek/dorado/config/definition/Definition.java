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

package com.bstek.dorado.config.definition;

import java.beans.PropertyDescriptor;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.beanutils.ConvertUtils;
import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.config.ConfigUtils;
import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.util.CloneUtils;

/**
 * 配置声明对象的抽象类。
 * <p>
 * 配置声明对象即可用于保存配置文件的解析后得到的中间信息，也兼具利用这些配置信息生成最终对象的功能。
 * </p>
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 7, 2008
 */
public abstract class Definition implements Cloneable {
	private static final Object[] EMPTY_ARGS = new Object[0];

	private Resource resource;
	private Resource[] dependentResources;

	private Map<String, Object> properties;
	private Map<String, Object> unmodifiableProperties;
	private List<Operation> initOperations;
	private List<Operation> unmodifiableInitOperations;

	/**
	 * 返回对象归属的文件资源。<br>
	 * 归属的资源是指该对象定义在哪个配置文件中。 如果对象并非由配置文件产生，那么该方法将返回null。
	 */
	public Resource getResource() {
		return resource;
	}

	/**
	 * 设置对象归属的文件资源。
	 * 
	 * @see #getResource()
	 */
	public void setResource(Resource resource) {
		this.resource = resource;
	}

	/**
	 * @return
	 */
	public Resource[] getDependentResources() {
		return dependentResources;
	}

	/**
	 * @param dependentResources
	 */
	public void setDependentResources(Resource[] dependentResources) {
		this.dependentResources = dependentResources;
	}

	private Map<String, Object> getOrCreateProperties() {
		if (properties == null) {
			properties = new HashMap<String, Object>();
			unmodifiableProperties = Collections.unmodifiableMap(properties);
		}
		return properties;
	}

	/**
	 * 返回最终对象的一组属性值。这些属性值将在创建对象时被初始化到新生成的对象中。<br>
	 * 此方法返回值为Map集合，其中Map的键为属性名，值为相应的属性值。<br>
	 * 需要注意的是，此处的属性值可能并不是真正的数值，它有可能是以下四种情况之一:
	 * <ul>
	 * <li>具体的数值。</li>
	 * <li>EL表达式{@link com.bstek.dorado.core.el.Expression}。</li>
	 * <li>配置声明对象{@link com.bstek.dorado.config.definition.Definition}
	 * ，在最终初始化对象时将被转换成具体的数据或对象。</li>
	 * <li>配置声明对象的引用
	 * {@link com.bstek.dorado.config.definition.DefinitionReference}
	 * ，在最终初始化对象时将被转换成具体的数据或对象。</li>
	 * </ul>
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getProperties() {
		return (unmodifiableProperties != null) ? unmodifiableProperties
				: Collections.EMPTY_MAP;
	}

	public Object getProperty(String property) {
		return (properties != null) ? properties.get(property) : null;
	}

	public void setProperty(String property, Object value) {
		getOrCreateProperties().put(property, value);
	}

	public Object removeProperty(String property) {
		return (properties != null) ? properties.remove(property) : null;
	}

	public void setProperties(Map<String, Object> properties) {
		getOrCreateProperties().putAll(properties);
	}

	/**
	 * 将一系列属性值初始化到给定的对象中。
	 * 
	 * @param object
	 *            被初始化的对象。
	 * @param properties
	 *            属性值的集合。
	 * @param context
	 *            创建最终对象的上下文。
	 * @throws Exception
	 */
	protected void initProperties(Object object,
			Map<String, Object> properties, CreationContext context)
			throws Exception {
		for (Map.Entry<String, Object> entry : properties.entrySet()) {
			String property = entry.getKey();
			Object value = entry.getValue();
			try {
				setObjectProperty(object, property, value, context);
			} catch (Exception e) {
				throw new IllegalArgumentException(
						"Error occured while writing [" + value
								+ "] into property [" + property + "]", e);
			}
		}
	}

	/**
	 * 将一个属性值初始化到给定的对象中。
	 * 
	 * @param object
	 *            被初始化的对象。
	 * @param property
	 *            属性名。
	 * @param value
	 *            属性值。@see {@link #getProperties()}
	 * @param context
	 *            创建最终对象的上下文。
	 * @throws Exception
	 */
	@SuppressWarnings({ "unchecked", "rawtypes" })
	protected void setObjectProperty(Object object, String property,
			Object value, CreationContext context) throws Exception {
		if (object instanceof Map) {
			value = DefinitionUtils.getRealValue(value, context);
			if (value instanceof DefinitionSupportedList
					&& ((DefinitionSupportedList) value).hasDefinitions()) {
				List collection = new ArrayList();
				for (Object element : (Collection) value) {
					Object realElement = DefinitionUtils.getRealValue(element,
							context);
					if (realElement != ConfigUtils.IGNORE_VALUE) {
						collection.add(realElement);
					}
				}
				value = collection;
			}
			if (value != ConfigUtils.IGNORE_VALUE) {
				((Map) object).put(property, value);
			}
		} else {
			PropertyDescriptor propertyDescriptor = PropertyUtils
					.getPropertyDescriptor(object, property);
			if (propertyDescriptor != null) {
				Method readMethod = propertyDescriptor.getReadMethod();
				Method writeMethod = propertyDescriptor.getWriteMethod();

				Class<?> propertyType = propertyDescriptor.getPropertyType();
				if (writeMethod != null) {
					Class<?> oldImpl = context.getDefaultImpl();
					try {
						context.setDefaultImpl(propertyType);
						value = DefinitionUtils.getRealValue(value, context);
					} finally {
						context.setDefaultImpl(oldImpl);
					}
					if (!propertyType.equals(String.class)
							&& value instanceof String) {
						if (propertyType.isEnum()) {
							value = Enum.valueOf((Class) propertyType,
									(String) value);
						} else if (StringUtils.isBlank((String) value)) {
							value = null;
						}
					} else if (value instanceof DefinitionSupportedList
							&& ((DefinitionSupportedList) value)
									.hasDefinitions()) {
						List collection = new ArrayList();
						for (Object element : (Collection) value) {
							Object realElement = DefinitionUtils.getRealValue(
									element, context);
							if (realElement != ConfigUtils.IGNORE_VALUE) {
								collection.add(realElement);
							}
						}
						value = collection;
					}
					if (value != ConfigUtils.IGNORE_VALUE) {
						writeMethod.invoke(object, new Object[] { ConvertUtils
								.convert(value, propertyType) });
					}
				} else if (readMethod != null
						&& Collection.class.isAssignableFrom(propertyType)) {
					Collection collection = (Collection) readMethod.invoke(
							object, EMPTY_ARGS);
					if (collection != null) {
						if (value instanceof DefinitionSupportedList
								&& ((DefinitionSupportedList) value)
										.hasDefinitions()) {
							for (Object element : (Collection) value) {
								Object realElement = DefinitionUtils
										.getRealValue(element, context);
								if (realElement != ConfigUtils.IGNORE_VALUE) {
									collection.add(realElement);
								}
							}
						} else {
							collection.addAll((Collection) value);
						}
					}
				} else {
					throw new NoSuchMethodException("Property [" + property
							+ "] of [" + object + "] is not writable.");
				}
			} else {
				throw new NoSuchMethodException("Property [" + property
						+ "] not found in [" + object + "].");
			}
		}
	}

	/**
	 * 添加一个初始化操作，该操作将在创建最终对象时被执行。
	 * 
	 * @param operation
	 *            初始化操作
	 */
	public void addInitOperation(Operation operation) {
		if (initOperations == null) {
			initOperations = new ArrayList<Operation>();
			unmodifiableInitOperations = Collections
					.unmodifiableList(initOperations);
		}
		initOperations.add(operation);
	}

	/**
	 * 返回所有的初始化操作。
	 * 
	 * @see #addInitOperation(Operation)
	 */
	@SuppressWarnings("unchecked")
	public List<Operation> getInitOperations() {
		return (unmodifiableInitOperations != null) ? unmodifiableInitOperations
				: Collections.EMPTY_LIST;
	}

	/**
	 * 执行一系列初始化操作。
	 * 
	 * @param object
	 *            被初始化的对象
	 * @param operations
	 *            初始化操作的集合
	 * @param context
	 *            创建最终对象的上下文
	 * @throws Exception
	 */
	protected void executeInitOperations(Object object,
			List<Operation> operations, CreationContext context)
			throws Exception {
		if (operations != null) {
			for (Operation operation : operations) {
				operation.execute(object, context);
			}
		}
	}

	protected abstract Object doCreate(CreationContext context,
			Object[] constuctorArgs) throws Exception;

	/**
	 * 根据配置声明对象自身的定义创建最终对象。
	 * 
	 * @param context
	 *            创建最终对象的上下文
	 * @return 最终对象
	 * @throws Exception
	 */
	public final Object create(CreationContext context) throws Exception {
		Object object = doCreate(context, null);
		if (object != null && object instanceof DefinitionPostProcessor) {
			((DefinitionPostProcessor) object).onInit();
		}
		return object;
	}

	/**
	 * 根据配置声明对象自身的定义创建最终对象。
	 * 
	 * @param context
	 *            创建最终对象的上下文
	 * @param constructorArgs
	 *            构造参数
	 * @return 最终对象
	 * @throws Exception
	 */
	public final Object create(CreationContext context, Object[] constructorArgs)
			throws Exception {
		Object object = doCreate(context, constructorArgs);
		if (object != null && object instanceof DefinitionPostProcessor) {
			((DefinitionPostProcessor) object).onInit();
		}
		return object;
	}

	@Override
	protected Object clone() throws CloneNotSupportedException {
		Definition definition = (Definition) super.clone();
		if (properties != null) {
			definition.properties = CloneUtils.clone(properties);
			definition.unmodifiableProperties = Collections
					.unmodifiableMap(definition.properties);
		}
		if (initOperations != null) {
			definition.initOperations = CloneUtils.clone(initOperations);
			definition.unmodifiableInitOperations = Collections
					.unmodifiableList(definition.unmodifiableInitOperations);
		}
		return definition;
	}

}
