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

import javassist.Modifier;

import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.annotation.XmlProperty;

/**
 * DataType的抽象实现类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 9, 2007
 */
@XmlNode(nodeName = "DataType")
public abstract class AbstractDataType implements RudeDataType {
	private String name;
	private String id;
	private Class<?> matchType;
	private Class<?> creationType;
	private String tags;
	private Map<String, Object> metaData;

	@XmlProperty(ignored = true, attributeOnly = true)
	public String getName() {
		return name;
	}

	/**
	 * 设置DataType的名称。
	 */
	public void setName(String name) {
		this.name = name;
		if (StringUtils.isEmpty(id)) {
			id = name;
		}
	}

	@XmlProperty(unsupported = true)
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	@ClientProperty(ignored = true)
	public Class<?> getMatchType() {
		return matchType;
	}

	public void setMatchType(Class<?> matchType) {
		this.matchType = matchType;
		if (creationType == null && !matchType.isInterface()
				&& !Modifier.isAbstract(matchType.getModifiers())) {
			creationType = matchType;
		}
	}

	@ClientProperty(ignored = true)
	public Class<?> getCreationType() {
		return creationType;
	}

	public void setCreationType(Class<?> creationType) {
		this.creationType = creationType;
	}

	public String getTags() {
		return tags;
	}

	public void setTags(String tags) {
		this.tags = tags;
	}

	public String toText(Object value) {
		return (value == null) ? null : value.toString();
	}

	public Object fromObject(Object value) {
		if (value == null) {
			return null;
		}

		Class<?> targetType = this.getMatchType();
		if (targetType == null) {
			return value;
		} else if (targetType.isAssignableFrom(value.getClass())) {
			return value;
		}

		throw new DataConvertException(value.getClass(), getMatchType());
	}

	public Object toObject(Object value) {
		if (value == null) {
			return null;
		}

		Class<?> targetType = this.getMatchType();
		if (targetType != null
				&& !targetType.isAssignableFrom(value.getClass())) {
			throw new IllegalArgumentException("Type error! "
					+ targetType.getName() + " expected but "
					+ value.getClass().getName() + " found.");
		}
		return value;
	}

	@Override
	public String toString() {
		return ObjectUtils.identityToString(this) + " [" + "name=" + getName()
				+ ", " + "matchType=" + getMatchType() + "]";
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
