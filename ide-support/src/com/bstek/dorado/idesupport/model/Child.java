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

package com.bstek.dorado.idesupport.model;

import java.util.Comparator;
import java.util.Set;
import java.util.TreeSet;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-11-18
 */
public class Child {
	private String name;
	private Rule rule;
	private Set<Rule> concreteRules = new TreeSet<Rule>(new Comparator<Rule>() {
		public int compare(Rule rule1, Rule rule2) {
			int result = rule1.getSortFactor() - rule2.getSortFactor();
			if (result == 0) {
				result = rule1.getName().compareTo(rule2.getName());
			}
			return result;
		}

	});
	private boolean fixed;
	private boolean aggregated;
	private int clientTypes;
	private boolean deprecated;
	private String reserve;
	private Object userData;

	public Child(String name) {
		this.name = name;
	}

	public String getName() {
		return name;
	}

	public void setRule(Rule rule) {
		this.rule = rule;
	}

	public Rule getRule() {
		return rule;
	}

	public Set<Rule> getConcreteRules() {
		return concreteRules;
	}

	public boolean isFixed() {
		return fixed;
	}

	public void setFixed(boolean fixed) {
		this.fixed = fixed;
	}

	public boolean isAggregated() {
		return aggregated;
	}

	public void setAggregated(boolean aggregated) {
		this.aggregated = aggregated;
	}

	public int getClientTypes() {
		return clientTypes;
	}

	public void setClientTypes(int clientTypes) {
		this.clientTypes = clientTypes;
	}

	public boolean isDeprecated() {
		return deprecated;
	}

	public void setDeprecated(boolean deprecated) {
		this.deprecated = deprecated;
	}

	public String getReserve() {
		return reserve;
	}

	public void setReserve(String reserve) {
		this.reserve = reserve;
	}

	public Object getUserData() {
		return userData;
	}

	public void setUserData(Object userData) {
		this.userData = userData;
	}
}
