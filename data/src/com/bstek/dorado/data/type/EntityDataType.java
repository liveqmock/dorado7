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

import java.util.Map;

import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.annotation.XmlSubNode;
import com.bstek.dorado.common.event.ClientEventSupported;
import com.bstek.dorado.data.type.property.PropertyDef;
import com.bstek.dorado.data.type.validator.MessageState;

/**
 * 实体类型的通用接口。
 * <p>
 * 实体类型一般包含java.util.Map、java.util.Properties、Bean这几种， 他们的共同点是具有属性或键值的概念。<br>
 * 实体类型可以通过{@link #getPropertyDefs()}中的属性定义对象来对其中的部分属性的操作方式进行定义。
 * </p>
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 13, 2007
 */
@XmlNode(nodeName = "DataType", parser = "spring:dorado.dataTypeParser", definitionType = "com.bstek.dorado.data.config.definition.DataTypeDefinition", inheritable = true, properties = @XmlProperty(propertyName = "overwrite", propertyType = "boolean", attributeOnly = true, ignored = true), subNodes = { @XmlSubNode(propertyType = "com.bstek.dorado.data.type.property.PropertyDef[]") })
@ClientObject(prototype = "dorado.EntityDataType", shortTypeName = "Default")
@ClientEvents({
		@com.bstek.dorado.annotation.ClientEvent(name = "beforeCurrentChange"),
		@com.bstek.dorado.annotation.ClientEvent(name = "onCurrentChange"),
		@com.bstek.dorado.annotation.ClientEvent(name = "beforeInsert"),
		@com.bstek.dorado.annotation.ClientEvent(name = "onInsert"),
		@com.bstek.dorado.annotation.ClientEvent(name = "beforeRemove"),
		@com.bstek.dorado.annotation.ClientEvent(name = "onRemove"),
		@com.bstek.dorado.annotation.ClientEvent(name = "beforeDataChange"),
		@com.bstek.dorado.annotation.ClientEvent(name = "onDataChange"),
		@com.bstek.dorado.annotation.ClientEvent(name = "beforeStateChange"),
		@com.bstek.dorado.annotation.ClientEvent(name = "onStateChange"),
		@com.bstek.dorado.annotation.ClientEvent(name = "onEntityLoad"),
		@com.bstek.dorado.annotation.ClientEvent(name = "onMessageChange"),
		@com.bstek.dorado.annotation.ClientEvent(name = "onEntityToText") })
public interface EntityDataType extends MutableDataType, ClientEventSupported {
	/**
	 * 返回属性声明的集合。
	 */
	Map<String, PropertyDef> getPropertyDefs();

	/**
	 * 向属性集合中添加一个属性。
	 * 
	 * @param propertyDef
	 *            属性声明对象。
	 * @return 属性声明对象。
	 */
	PropertyDef addPropertyDef(PropertyDef propertyDef);

	/**
	 * 根据名称返回一个属性声明对象。
	 * 
	 * @param propertyName
	 *            属性名。
	 * @return 属性声明对象。
	 */
	PropertyDef getPropertyDef(String propertyName);

	boolean isAcceptUnknownProperty();

	void setAcceptUnknownProperty(boolean acceptUnknownProperty);

	boolean isAutoCreatePropertyDefs();

	void setAutoCreatePropertyDefs(boolean autoCreatePropertyDefs);

	MessageState getAcceptValidationState();

	void setAcceptValidationState(MessageState acceptValidationState);

	void createPropertyDefs() throws Exception;

	String getDefaultDisplayProperty();

	void setDefaultDisplayProperty(String defaultDisplayProperty);
}
