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

package com.bstek.dorado.idesupport.template;

import java.beans.PropertyDescriptor;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.idesupport.model.ClientEvent;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-11-18
 */
public class RuleTemplate {
	private RuleTemplate[] parents;
	private Set<RuleTemplate> subRuleTemplates;

	private String type;

	private String name;
	private String label;
	private String nodeName;
	private boolean _abstract;

	private String category;
	private String[] robots;
	private int sortFactor;
	private String scope = "public";
	private String icon;
	private String labelProperty;
	private boolean autoGenerateId;
	private int clientTypes;
	private String reserve;
	private boolean deprecated;
	private boolean visible = true;

	private boolean global;
	private boolean autoInitialize = true;
	private boolean initialized;
	private boolean inheritanceProcessed;

	private Map<String, PropertyTemplate> primitiveProperties = new LinkedHashMap<String, PropertyTemplate>();
	private Map<String, PropertyTemplate> properties = new LinkedHashMap<String, PropertyTemplate>();
	private Map<String, ClientEvent> clientEvents = new LinkedHashMap<String, ClientEvent>();
	private Map<String, ChildTemplate> children = new LinkedHashMap<String, ChildTemplate>();

	public RuleTemplate(String name) {
		this.name = name;
	}

	public RuleTemplate(String name, String type) {
		this(name);
		this.type = type;
	}

	public String getName() {
		return name;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public RuleTemplate[] getParents() {
		return parents;
	}

	public void setParents(RuleTemplate[] parents) {
		if (this.parents != null) {
			for (RuleTemplate parent : this.parents) {
				if (parent.subRuleTemplates != null)
					parent.subRuleTemplates.remove(this);
			}
		}
		this.parents = parents;
		if (parents != null) {
			for (RuleTemplate parent : parents) {
				if (parent.subRuleTemplates == null) {
					parent.subRuleTemplates = new LinkedHashSet<RuleTemplate>();
				}
				parent.subRuleTemplates.add(this);
			}
		}
	}

	public RuleTemplate[] getSubRuleTemplates() {
		RuleTemplate[] ruleTemplates = new RuleTemplate[0];
		if (subRuleTemplates != null) {
			ruleTemplates = subRuleTemplates.toArray(ruleTemplates);
		}
		return ruleTemplates;
	}

	public String getNodeName() {
		return nodeName;
	}

	public void setNodeName(String nodeName) {
		this.nodeName = nodeName;
	}

	public boolean isAbstract() {
		return _abstract;
	}

	public void setAbstract(boolean _abstract) {
		this._abstract = _abstract;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String[] getRobots() {
		return robots;
	}

	public void setRobots(String[] robots) {
		this.robots = robots;
	}

	public boolean isGlobal() {
		return global;
	}

	public void setGlobal(boolean global) {
		this.global = global;
	}

	public boolean isAutoInitialize() {
		return autoInitialize;
	}

	public void setAutoInitialize(boolean autoInitialize) {
		this.autoInitialize = autoInitialize;
	}

	public boolean isInitialized() {
		return initialized;
	}

	public void setInitialized(boolean initialized) {
		this.initialized = initialized;
	}

	public Map<String, PropertyTemplate> getPrimitiveProperties() {
		return primitiveProperties;
	}

	public void addPrimitiveProperties(
			Collection<PropertyTemplate> primitiveProperties) {
		for (PropertyTemplate property : primitiveProperties) {
			addPrimitiveProperty(property);
		}
	}

	public void addPrimitiveProperty(PropertyTemplate property) {
		primitiveProperties.put(property.getName(), property);
	}

	public PropertyTemplate getPrimitiveProperty(String name) {
		return primitiveProperties.get(name);
	}

	public Map<String, PropertyTemplate> getProperties() {
		return properties;
	}

	public PropertyTemplate getProperty(String name) {
		return properties.get(name);
	}

	public void addProperties(Collection<PropertyTemplate> properties) {
		for (PropertyTemplate property : properties) {
			addProperty(property);
		}
	}

	public void addProperty(PropertyTemplate property) {
		properties.put(property.getName(), property);
	}

	public Map<String, ClientEvent> getClientEvents() {
		return clientEvents;
	}

	public ClientEvent getClientEvent(String name) {
		return clientEvents.get(name);
	}

	public void addClientEvents(Collection<ClientEvent> clientEvents) {
		for (ClientEvent clientEvent : clientEvents) {
			addClientEvent(clientEvent);
		}
	}

	public void addClientEvent(ClientEvent clientEvent) {
		clientEvents.put(clientEvent.getName(), clientEvent);
	}

	public Map<String, ChildTemplate> getChildren() {
		return children;
	}

	public ChildTemplate getChild(String childName) {
		return children.get(childName);
	}

	public void addChildren(Collection<ChildTemplate> children) {
		for (ChildTemplate childTemplate : children) {
			addChild(childTemplate);
		}
	}

	public void addChild(ChildTemplate childTemplate) {
		children.put(childTemplate.getName(), childTemplate);
	}

	public Map<String, PropertyTemplate> getFinalPrimitiveProperties()
			throws Exception {
		if (parents != null && parents.length > 0) {
			Map<String, PropertyTemplate> finalPrimitiveProperties = new LinkedHashMap<String, PropertyTemplate>();
			for (RuleTemplate parent : parents) {
				for (Map.Entry<String, PropertyTemplate> entry : parent
						.getFinalPrimitiveProperties().entrySet()) {
					String propertyName = entry.getKey();
					PropertyTemplate targetProperty = entry.getValue();
					PropertyTemplate originProperty = finalPrimitiveProperties
							.get(propertyName);
					if (originProperty != null) {
						applyProperties(originProperty, targetProperty);
					}
					finalPrimitiveProperties.put(propertyName, targetProperty);
				}
			}

			for (Map.Entry<String, PropertyTemplate> entry : primitiveProperties
					.entrySet()) {
				String propertyName = entry.getKey();
				PropertyTemplate targetProperty = entry.getValue();
				PropertyTemplate originProperty = finalPrimitiveProperties
						.get(propertyName);
				if (originProperty != null) {
					applyProperties(originProperty, targetProperty);
				}
				finalPrimitiveProperties.put(propertyName, targetProperty);
			}
			return finalPrimitiveProperties;
		} else {
			return primitiveProperties;
		}
	}

	public Map<String, PropertyTemplate> getFinalProperties() throws Exception {
		if (parents != null && parents.length > 0) {
			Map<String, PropertyTemplate> finalProperties = new LinkedHashMap<String, PropertyTemplate>();
			for (RuleTemplate parent : parents) {
				for (Map.Entry<String, PropertyTemplate> entry : parent
						.getFinalProperties().entrySet()) {
					String propertyName = entry.getKey();
					PropertyTemplate targetProperty = entry.getValue();
					PropertyTemplate originProperty = finalProperties
							.get(propertyName);
					if (originProperty != null) {
						applyProperties(originProperty, targetProperty);
					}
					finalProperties.put(propertyName, targetProperty);
				}
			}

			for (Map.Entry<String, PropertyTemplate> entry : properties
					.entrySet()) {
				String propertyName = entry.getKey();
				PropertyTemplate targetProperty = entry.getValue();
				PropertyTemplate originProperty = finalProperties
						.get(propertyName);
				if (originProperty != null) {
					applyProperties(originProperty, targetProperty);
				}
				finalProperties.put(propertyName, targetProperty);
			}
			return finalProperties;
		} else {
			return properties;
		}
	}

	public Map<String, ClientEvent> getFinalClientEvents() {
		if (parents != null && parents.length > 0) {
			Map<String, ClientEvent> finalClientEvents = new LinkedHashMap<String, ClientEvent>();
			for (RuleTemplate parent : parents) {
				finalClientEvents.putAll(parent.getFinalClientEvents());
			}
			finalClientEvents.putAll(clientEvents);
			return finalClientEvents;
		} else {
			return clientEvents;
		}
	}

	public Map<String, ChildTemplate> getFinalChildren() {
		if (parents != null && parents.length > 0) {
			Map<String, ChildTemplate> finalChildren = new LinkedHashMap<String, ChildTemplate>();
			for (RuleTemplate parent : parents) {
				for (Map.Entry<String, ChildTemplate> entry : parent
						.getFinalChildren().entrySet()) {
					ChildTemplate childTemplate = entry.getValue();
					if (childTemplate.isPublic()) {
						finalChildren.put(entry.getKey(), childTemplate);
					}
				}
			}
			finalChildren.putAll(children);
			return finalChildren;
		} else {
			return children;
		}
	}

	public void processInheritance() throws Exception {
		if (inheritanceProcessed) {
			return;
		}
		inheritanceProcessed = true;

		final String InheritablePropertyNames = "label,icon,nodeName,type";
		if (parents != null && parents.length > 0) {
			Map<String, Object> props = new HashMap<String, Object>();
			applyProperties(this, props, InheritablePropertyNames);
			for (RuleTemplate parent : parents) {
				parent.processInheritance();
				applyProperties(parent, this, InheritablePropertyNames);
			}
			applyProperties(props, this, InheritablePropertyNames);
		}
	}

	private static void applyProperties(Object source, Object target,
			String propertyNames) throws Exception {
		if (StringUtils.isNotEmpty(propertyNames)) {
			for (String propertyName : StringUtils.split(propertyNames, ',')) {
				applyProperty(source, target, propertyName);
			}
		}
	}

	private static void applyProperties(Object source, Object target)
			throws Exception {
		for (PropertyDescriptor propertyDescriptor : PropertyUtils
				.getPropertyDescriptors(target)) {
			if (propertyDescriptor.getReadMethod() != null
					&& propertyDescriptor.getWriteMethod() != null) {
				applyProperty(source, target, propertyDescriptor.getName());
			}
		}
	}

	private static void applyProperty(Object source, Object target,
			String propertyName) throws Exception {
		Object value = PropertyUtils.getProperty(source, propertyName);
		if (value != null
				&& PropertyUtils.getProperty(target, propertyName) == null)
			PropertyUtils.setProperty(target, propertyName, value);
	}

	public String getScope() {
		return scope;
	}

	public void setScope(String scope) {
		this.scope = scope;
	}

	public int getSortFactor() {
		return sortFactor;
	}

	public void setSortFactor(int sortFactor) {
		this.sortFactor = sortFactor;
	}

	public String getIcon() {
		return icon;
	}

	public void setIcon(String icon) {
		this.icon = icon;
	}

	public String getLabelProperty() {
		return labelProperty;
	}

	public void setLabelProperty(String labelProperty) {
		this.labelProperty = labelProperty;
	}

	public boolean isAutoGenerateId() {
		return autoGenerateId;
	}

	public void setAutoGenerateId(boolean autoGenerateId) {
		this.autoGenerateId = autoGenerateId;
	}

	public int getClientTypes() {
		return clientTypes;
	}

	public void setClientTypes(int clientTypes) {
		this.clientTypes = clientTypes;
	}

	public String getReserve() {
		return reserve;
	}

	public void setReserve(String reserve) {
		this.reserve = reserve;
	}

	public boolean isDeprecated() {
		return deprecated;
	}

	public void setDeprecated(boolean deprecated) {
		this.deprecated = deprecated;
	}

	public boolean isVisible() {
		return visible;
	}

	public void setVisible(boolean visible) {
		this.visible = visible;
	}
}
