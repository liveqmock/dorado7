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

package com.bstek.dorado.data.type;

import java.beans.PropertyDescriptor;
import java.lang.reflect.ParameterizedType;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.beanutils.PropertyUtils;

import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.ResourceInjection;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.common.ParentAware;
import com.bstek.dorado.common.event.ClientEvent;
import com.bstek.dorado.common.event.ClientEventHolder;
import com.bstek.dorado.data.type.property.BasePropertyDef;
import com.bstek.dorado.data.type.property.PropertyDef;
import com.bstek.dorado.data.type.validator.MessageState;
import com.bstek.dorado.data.util.DataUtils;
import com.bstek.dorado.util.clazz.BeanPropertyUtils;
import com.bstek.dorado.util.proxy.ChildrenMapSupport;

/**
 * 实体类型抽像支持类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 13, 2007
 */
@ResourceInjection(subObjectMethod = "getPropertyDef")
public abstract class EntityDataTypeSupport extends NonAggregationDataType
		implements EntityDataType {
	private static class PropertyDefMap<K, V> extends ChildrenMapSupport<K, V> {
		private EntityDataTypeSupport entityDataType;

		public PropertyDefMap(Map<K, V> target,
				EntityDataTypeSupport entityDataType) {
			super(target);
			this.entityDataType = entityDataType;
		}

		@Override
		@SuppressWarnings("unchecked")
		protected void childAdded(Object key, Object child) {
			if (!entityDataType.acceptUnknownPropertyChanged) {
				entityDataType.acceptUnknownProperty = false;
			}
			if (child instanceof ParentAware<?>) {
				((ParentAware<EntityDataType>) child).setParent(entityDataType);
			}
		}

		@Override
		@SuppressWarnings("unchecked")
		protected void childRemoved(Object key, Object child) {
			if (child instanceof ParentAware<?>) {
				((ParentAware<EntityDataType>) child).setParent(null);
			}
		}
	}

	private boolean acceptUnknownPropertyChanged;
	private boolean acceptUnknownProperty = true;
	private MessageState acceptValidationState = MessageState.ok;
	private boolean autoCreatePropertyDefs;
	private String defaultDisplayProperty;
	private Object userData;

	private boolean autuCreatepropertyDefinitonsProcessed;
	private Map<String, PropertyDef> propertyDefs = new PropertyDefMap<String, PropertyDef>(
			new LinkedHashMap<String, PropertyDef>(), this);
	private ClientEventHolder clientEventHolder = new ClientEventHolder(this);

	public boolean isAcceptUnknownProperty() {
		return acceptUnknownProperty;
	}

	public void setAcceptUnknownProperty(boolean acceptUnknownProperty) {
		this.acceptUnknownProperty = acceptUnknownProperty;
		acceptUnknownPropertyChanged = true;
	}

	@ClientProperty(ignored = true)
	public boolean isAutoCreatePropertyDefs() {
		return autoCreatePropertyDefs;
	}

	public void setAutoCreatePropertyDefs(boolean autoCreatePropertyDefs) {
		this.autoCreatePropertyDefs = autoCreatePropertyDefs;
	}

	@ClientProperty(escapeValue = "ok")
	public MessageState getAcceptValidationState() {
		return acceptValidationState;
	}

	public void setAcceptValidationState(MessageState acceptValidationState) {
		this.acceptValidationState = acceptValidationState;
	}

	public String getDefaultDisplayProperty() {
		return defaultDisplayProperty;
	}

	public void setDefaultDisplayProperty(String defaultDisplayProperty) {
		this.defaultDisplayProperty = defaultDisplayProperty;
	}

	@XmlProperty
	@ClientProperty
	@IdeProperty(editor = "any")
	public Object getUserData() {
		return userData;
	}

	public void setUserData(Object userData) {
		this.userData = userData;
	}

	@ClientProperty(outputter = "spring:dorado.propertyDefsOutputter")
	public Map<String, PropertyDef> getPropertyDefs() {
		return propertyDefs;
	}

	public PropertyDef addPropertyDef(PropertyDef propertyDef) {
		String name = propertyDef.getName();
		if (propertyDefs.containsKey(name)) {
			throw new IllegalArgumentException("PropertyDef [" + name
					+ "] already exists in DataType [" + getName() + "].");
		}
		propertyDefs.put(name, propertyDef);
		return propertyDef;
	}

	public PropertyDef getPropertyDef(String propertyName) {
		return propertyDefs.get(propertyName);
	}

	public Object fromText(String text) {
		throw new DataConvertException(String.class, getMatchType());
	}

	public final void createPropertyDefs() throws Exception {
		if (!autuCreatepropertyDefinitonsProcessed) {
			autuCreatepropertyDefinitonsProcessed = true;
			doCreatePropertyDefinitons();
		}
	}

	protected void doCreatePropertyDefinitons() throws Exception {
		Class<?> type = getMatchType();
		if (type == null) {
			type = getCreationType();
		}
		if (type == null || type.isPrimitive() || type.isArray()
				|| Map.class.isAssignableFrom(type)) {
			return;
		}

		PropertyDescriptor[] propertyDescriptors = PropertyUtils
				.getPropertyDescriptors(type);
		for (PropertyDescriptor propertyDescriptor : propertyDescriptors) {
			String name = propertyDescriptor.getName();
			if (!BeanPropertyUtils.isValidProperty(type, name))
				continue;

			PropertyDef propertyDef = getPropertyDef(name);
			DataType dataType = null;
			Class<?> propertyType = propertyDescriptor.getPropertyType();
			if (Collection.class.isAssignableFrom(propertyType)) {
				ParameterizedType parameterizedType = (ParameterizedType) propertyDescriptor
						.getReadMethod().getGenericReturnType();
				if (parameterizedType != null) {
					dataType = DataUtils.getDataType(parameterizedType);
				}
			}

			if (dataType == null) {
				dataType = DataUtils.getDataType(propertyType);
			}

			if (propertyDef == null) {
				if (dataType != null) {
					propertyDef = new BasePropertyDef(name);
					propertyDef.setDataType(dataType);
					addPropertyDef(propertyDef);

					if (dataType instanceof EntityDataType
							|| dataType instanceof AggregationDataType) {
						propertyDef.setIgnored(true);
					}
				}
			} else if (propertyDef.getDataType() == null) {
				if (dataType != null)
					propertyDef.setDataType(dataType);
			}
		}
	}

	public void addClientEventListener(String eventName,
			ClientEvent eventListener) {
		clientEventHolder.addClientEventListener(eventName, eventListener);
	}

	public List<ClientEvent> getClientEventListeners(String eventName) {
		return clientEventHolder.getClientEventListeners(eventName);
	}

	public void clearClientEventListeners(String eventName) {
		clientEventHolder.clearClientEventListeners(eventName);
	}

	public Map<String, List<ClientEvent>> getAllClientEventListeners() {
		return clientEventHolder.getAllClientEventListeners();
	}
}
