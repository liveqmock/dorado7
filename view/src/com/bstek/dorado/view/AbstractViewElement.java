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

package com.bstek.dorado.view;

import java.util.Collection;
import java.util.HashSet;
import java.util.Map;

import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.common.Ignorable;
import com.bstek.dorado.common.MetaDataSupport;
import com.bstek.dorado.common.TagSupport;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2014-1-15
 */
public abstract class AbstractViewElement implements ViewElement, TagSupport,
		Ignorable, UserDataSupport, MetaDataSupport {
	private String id;
	private ViewElement parent;
	private View view;
	private String tags;
	private boolean ignored;
	private Object userData;
	private Map<String, Object> metaData;
	private Collection<ViewElement> innerElements;

	/**
	 * 设置组件的id。
	 */
	public void setId(String id) {
		if (view != null) {
			throw new IllegalStateException(
					"Can not change the id property after the component attach to a view.");
		}
		this.id = id;
	}

	/**
	 * 返回组件的id。
	 */
	@XmlProperty(attributeOnly = true)
	@IdeProperty(highlight = 1)
	public String getId() {
		return id;
	}

	/**
	 * 返回控件的父控件，即控件所属的容器。
	 */
	@XmlProperty(unsupported = true)
	@IdeProperty(visible = false)
	public ViewElement getParent() {
		return parent;
	}

	/**
	 * 设置控件的父控件，即控件所属的容器。
	 */
	public void setParent(ViewElement parent) {
		ViewElementUtils.clearParentViewElement(this, this.parent);
		this.parent = parent;
		ViewElementUtils.setParentViewElement(this, parent);
	}

	@XmlProperty(unsupported = true)
	public View getView() {
		return view;
	}

	/**
	 * 返回用于保存自定义信息的对象。
	 */
	public String getTags() {
		return tags;
	}

	/**
	 * 设置用于保存自定义信息的对象。
	 */
	public void setTags(String tags) {
		this.tags = tags;
	}

	@ClientProperty(ignored = true)
	public boolean isIgnored() {
		return ignored;
	}

	public void setIgnored(boolean ignored) {
		this.ignored = ignored;
	}

	@XmlProperty
	@ClientProperty
	public Object getUserData() {
		return userData;
	}

	public void setUserData(Object userData) {
		this.userData = userData;
	}

	@XmlProperty(composite = true)
	public Map<String, Object> getMetaData() {
		return metaData;
	}

	public void setMetaData(Map<String, Object> metaData) {
		this.metaData = metaData;
	}

	public void registerInnerElement(ViewElement element) {
		if (innerElements == null) {
			innerElements = new HashSet<ViewElement>();
		}
		innerElements.add(element);
	}

	public void unregisterInnerElement(ViewElement element) {
		if (innerElements != null) {
			innerElements.remove(element);
		}
	}

	public Collection<ViewElement> getInnerElements() {
		return innerElements;
	}

}