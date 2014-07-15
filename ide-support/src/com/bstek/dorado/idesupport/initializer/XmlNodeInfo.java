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

package com.bstek.dorado.idesupport.initializer;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.annotation.XmlSubNode;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-12-8
 */
public class XmlNodeInfo {
	private List<Class<?>> sourceTypes;

	private String scope;
	private String nodeName;
	private String label;
	private String icon;
	private String definitionType;
	private Set<String> implTypes = new HashSet<String>();
	private boolean scopable;
	private boolean inheritable;
	private int[] clientTypes;
	private boolean deprecated;
	private boolean visible = true;
	private Map<String, String> fixedProperties = new HashMap<String, String>();
	private Map<String, XmlProperty> properties = new HashMap<String, XmlProperty>();
	private Set<XmlSubNode> subNodes = new HashSet<XmlSubNode>();

	public void addSourceType(Class<?> sourceType) {
		if (sourceTypes == null) {
			sourceTypes = new ArrayList<Class<?>>();
		}
		sourceTypes.add(sourceType);
	}

	public List<Class<?>> getSourceTypes() {
		return sourceTypes;
	}

	public String getScope() {
		return scope;
	}

	public void setScope(String scope) {
		this.scope = scope;
	}

	public String getNodeName() {
		return nodeName;
	}

	public void setNodeName(String nodeName) {
		this.nodeName = nodeName;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public String getIcon() {
		return icon;
	}

	public void setIcon(String icon) {
		this.icon = icon;
	}

	public String getDefinitionType() {
		return definitionType;
	}

	public void setDefinitionType(String definitionType) {
		this.definitionType = definitionType;
	}

	public Set<String> getImplTypes() {
		return implTypes;
	}

	public boolean isScopable() {
		return scopable;
	}

	public void setScopable(boolean scopable) {
		this.scopable = scopable;
	}

	public boolean isInheritable() {
		return inheritable;
	}

	public void setInheritable(boolean inheritable) {
		this.inheritable = inheritable;
	}

	public boolean isVisible() {
		return visible;
	}

	public void setVisible(boolean visible) {
		this.visible = visible;
	}

	public int[] getClientTypes() {
		return clientTypes;
	}

	public void setClientTypes(int[] clientTypes) {
		this.clientTypes = clientTypes;
	}

	public boolean isDeprecated() {
		return deprecated;
	}

	public void setDeprecated(boolean deprecated) {
		this.deprecated = deprecated;
	}

	public Map<String, String> getFixedProperties() {
		return fixedProperties;
	}

	public Map<String, XmlProperty> getProperties() {
		return properties;
	}

	public Set<XmlSubNode> getSubNodes() {
		return subNodes;
	}

}
