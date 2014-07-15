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

package com.bstek.dorado.view.widget.tree;

import java.util.ArrayList;
import java.util.List;

import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.annotation.XmlSubNode;
import com.bstek.dorado.common.Ignorable;
import com.bstek.dorado.common.TagSupport;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-9-30
 */
@XmlNode
public class BindingConfig implements Ignorable, TagSupport {
	private String name;
	private String childrenProperty;
	private boolean recursive;
	private int expandLevel;
	private String labelProperty;
	private String icon;
	private String iconProperty;
	private String iconClass;
	private String expandedIcon;
	private String expandedIconProperty;
	private String expandedIconClass;
	private boolean checkable;
	private String checkedProperty;
	private boolean autoCheckChildren = true;
	private String tipProperty;
	private Boolean hasChild;
	private String hasChildProperty;
	private boolean ignored;
	private String tags;

	private List<BindingConfig> childBindingConfigs = new ArrayList<BindingConfig>();

	@XmlSubNode
	@ClientProperty
	public List<BindingConfig> getChildBindingConfigs() {
		return childBindingConfigs;
	}

	public void addChildBindingConfig(BindingConfig bindingConfig) {
		childBindingConfigs.add(bindingConfig);
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getChildrenProperty() {
		return childrenProperty;
	}

	public void setChildrenProperty(String childrenProperty) {
		this.childrenProperty = childrenProperty;
	}

	public boolean isRecursive() {
		return recursive;
	}

	public void setRecursive(boolean recursive) {
		this.recursive = recursive;
	}

	public int getExpandLevel() {
		return expandLevel;
	}

	public void setExpandLevel(int expandLevel) {
		this.expandLevel = expandLevel;
	}

	public String getLabelProperty() {
		return labelProperty;
	}

	public void setLabelProperty(String labelProperty) {
		this.labelProperty = labelProperty;
	}

	public String getIcon() {
		return icon;
	}

	public void setIcon(String icon) {
		this.icon = icon;
	}

	public String getIconProperty() {
		return iconProperty;
	}

	public void setIconProperty(String iconProperty) {
		this.iconProperty = iconProperty;
	}

	public String getIconClass() {
		return iconClass;
	}

	public void setIconClass(String iconClass) {
		this.iconClass = iconClass;
	}

	public String getExpandedIcon() {
		return expandedIcon;
	}

	public void setExpandedIcon(String expandedIcon) {
		this.expandedIcon = expandedIcon;
	}

	public String getExpandedIconProperty() {
		return expandedIconProperty;
	}

	public void setExpandedIconProperty(String expandedIconProperty) {
		this.expandedIconProperty = expandedIconProperty;
	}

	public String getExpandedIconClass() {
		return expandedIconClass;
	}

	public void setExpandedIconClass(String expandedIconClass) {
		this.expandedIconClass = expandedIconClass;
	}

	public boolean isCheckable() {
		return checkable;
	}

	public void setCheckable(boolean checkable) {
		this.checkable = checkable;
	}

	public String getCheckedProperty() {
		return checkedProperty;
	}

	public void setCheckedProperty(String checkedProperty) {
		this.checkedProperty = checkedProperty;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isAutoCheckChildren() {
		return autoCheckChildren;
	}

	public void setAutoCheckChildren(boolean autoCheckChildren) {
		this.autoCheckChildren = autoCheckChildren;
	}

	public String getTipProperty() {
		return tipProperty;
	}

	public void setTipProperty(String tipProperty) {
		this.tipProperty = tipProperty;
	}

	public Boolean getHasChild() {
		return hasChild;
	}

	public void setHasChild(Boolean hasChild) {
		this.hasChild = hasChild;
	}

	public String getHasChildProperty() {
		return hasChildProperty;
	}

	public void setHasChildProperty(String hasChildProperty) {
		this.hasChildProperty = hasChildProperty;
	}

	public boolean isIgnored() {
		return ignored;
	}

	public void setIgnored(boolean ignored) {
		this.ignored = ignored;
	}

	public String getTags() {
		return tags;
	}

	public void setTags(String tags) {
		this.tags = tags;
	}
}
