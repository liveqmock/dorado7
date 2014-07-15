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

package com.bstek.dorado.idesupport;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Vector;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.core.pkgs.PackageInfo;
import com.bstek.dorado.idesupport.template.RuleTemplate;
import com.bstek.dorado.util.Assert;
import com.bstek.dorado.util.clazz.ClassUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-11-18
 */
public class RuleTemplateManager {
	private String version;
	private List<PackageInfo> packageInfos = new ArrayList<PackageInfo>();
	private Map<String, RuleTemplate> ruleTemplateMap = new LinkedHashMap<String, RuleTemplate>();
	private List<RuleTemplateManagerListener> listeners;

	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	public List<PackageInfo> getPackageInfos() {
		return packageInfos;
	}

	public void addRuleTemplate(RuleTemplate ruleTemplate) throws Exception {
		String name = ruleTemplate.getName();
		Assert.notEmpty(name);
		ruleTemplate.setGlobal(true);
		ruleTemplateMap.put(name, ruleTemplate);

		if (listeners != null) {
			for (RuleTemplateManagerListener listener : listeners) {
				listener.ruleTemplateAdded(this, ruleTemplate);
			}
		}
	}

	public void removeRuleTemplate(String name) throws Exception {
		ruleTemplateMap.remove(name);
	}

	public Collection<RuleTemplate> getRuleTemplates() {
		return ruleTemplateMap.values();
	}

	public RuleTemplate getRuleTemplate(String ruleName) {
		return ruleTemplateMap.get(ruleName);
	}

	public RuleTemplate getRuleTemplate(Class<?> type)
			throws ClassNotFoundException {
		for (RuleTemplate ruleTemplate : ruleTemplateMap.values()) {
			if (StringUtils.isNotEmpty(ruleTemplate.getType())) {
				Class<?> ruleType = ClassUtils.forName(ruleTemplate.getType());
				if (ruleType.equals(type)) {
					return ruleTemplate;
				}
			}
		}
		return null;
	}

	public void addListener(RuleTemplateManagerListener listener) {
		if (listeners == null) {
			listeners = new Vector<RuleTemplateManagerListener>();
		}
		listeners.add(listener);
	}

	public void removeListener(RuleTemplateManagerListener listener) {
		if (listeners != null) {
			listeners.remove(listener);
		}
	}
}
