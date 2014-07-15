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

package com.bstek.dorado.data.type.property;

import java.util.List;
import java.util.Map;

import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.annotation.XmlSubNode;
import com.bstek.dorado.common.Ignorable;
import com.bstek.dorado.common.MetaDataSupport;
import com.bstek.dorado.common.TagSupport;
import com.bstek.dorado.common.event.ClientEvent;
import com.bstek.dorado.common.event.ClientEventHolder;
import com.bstek.dorado.common.event.ClientEventSupported;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.data.type.EntityDataType;
import com.bstek.dorado.data.type.validator.Validator;

/**
 * 属性声明的通用接口。
 * <p>
 * 用于描述属性集类型中某个属性的对象。
 * </p>
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 13, 2007
 */
@XmlNode(
		definitionType = "com.bstek.dorado.data.config.definition.PropertyDefDefinition",
		implTypes = { "com.bstek.dorado.data.type.property.BasePropertyDef",
				"com.bstek.dorado.data.type.property.Reference" },
		properties = @XmlProperty(propertyName = "name",
				parser = "spring:dorado.staticPropertyParser",
				attributeOnly = true))
@ClientObject
@ClientEvents({ @com.bstek.dorado.annotation.ClientEvent(name = "onGet"),
		@com.bstek.dorado.annotation.ClientEvent(name = "onGetText"),
		@com.bstek.dorado.annotation.ClientEvent(name = "onSet"),
		@com.bstek.dorado.annotation.ClientEvent(name = "onValidate") })
public abstract class PropertyDef implements Ignorable, TagSupport,
		MetaDataSupport, ClientEventSupported {
	public static final String SELF_DATA_TYPE_NAME = "SELF";

	private String name;
	private String label;
	private EntityDataType parentDataType;
	private DataType dataType;
	private Object defaultValue;
	private String displayFormat;
	private Mapping mapping;
	private boolean acceptUnknownMapKey;
	private boolean readOnly;
	private boolean visible = true;
	private boolean required;
	private boolean ignored;
	private boolean submittable = true;
	private List<Validator> validators;
	private String tags;
	private Object userData;
	private Map<String, Object> metaData;

	private ClientEventHolder clientEventHolder = new ClientEventHolder(this);

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

	protected void setName(String name) {
		this.name = name;
	}

	/**
	 * 返回属性的名称。
	 * 
	 * @return
	 */
	@IdeProperty(highlight = 1)
	public String getName() {
		return name;
	}

	public void setParent(EntityDataType parent) {
		parentDataType = parent;
	}

	public EntityDataType getParent() {
		return parentDataType;
	}

	@XmlProperty(ignored = true)
	@ClientProperty
	@IdeProperty(highlight = 1)
	public DataType getDataType() {
		return dataType;
	}

	public void setDataType(DataType dataType) {
		this.dataType = dataType;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	@IdeProperty(highlight = 1)
	public String getLabel() {
		return label;
	}

	@XmlProperty
	@ClientProperty(outputter = "spring:dorado.defaultValueOutputter")
	public Object getDefaultValue() {
		return defaultValue;
	}

	public void setDefaultValue(Object defaultValue) {
		this.defaultValue = defaultValue;
	}

	public String getDisplayFormat() {
		return displayFormat;
	}

	public void setDisplayFormat(String displayFormat) {
		this.displayFormat = displayFormat;
	}

	@XmlProperty(composite = true)
	@ClientProperty(outputter = "spring:dorado.mappingPropertyOutputter")
	public Mapping getMapping() {
		return mapping;
	}

	public void setMapping(Mapping mapping) {
		this.mapping = mapping;
	}

	public boolean isAcceptUnknownMapKey() {
		return acceptUnknownMapKey;
	}

	public void setAcceptUnknownMapKey(boolean acceptUnknownMapKey) {
		this.acceptUnknownMapKey = acceptUnknownMapKey;
	}

	public boolean isReadOnly() {
		return readOnly;
	}

	public void setReadOnly(boolean readOnly) {
		this.readOnly = readOnly;
	}

	public boolean isRequired() {
		return required;
	}

	public void setRequired(boolean required) {
		this.required = required;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isVisible() {
		return visible;
	}

	public void setVisible(boolean visible) {
		this.visible = visible;
	}

	public boolean isIgnored() {
		return ignored;
	}

	public void setIgnored(boolean ignored) {
		this.ignored = ignored;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isSubmittable() {
		return submittable;
	}

	public void setSubmittable(boolean submittable) {
		this.submittable = submittable;
	}

	public void setValidators(List<Validator> validators) {
		this.validators = validators;
	}

	@XmlSubNode(nodeName = "Validator",
			parser = "spring:dorado.validatorParserDispatcher")
	@ClientProperty
	public List<Validator> getValidators() {
		return validators;
	}

	public String getTags() {
		return tags;
	}

	public void setTags(String tags) {
		this.tags = tags;
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

	@XmlProperty(composite = true)
	@ClientProperty(ignored = true)
	public Map<String, Object> getMetaData() {
		return metaData;
	}

	public void setMetaData(Map<String, Object> metaData) {
		this.metaData = metaData;
	}

}
