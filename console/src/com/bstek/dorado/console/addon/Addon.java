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

package com.bstek.dorado.console.addon;

import java.util.List;

import org.apache.commons.lang.StringUtils;

/**
 * Dorado Addon
 * 
 * @author Alex Tong (mailto:alex.tong@bstek.com)
 * @since 2012-12-07
 */
public class Addon {
	private String name;
	private String version;
	private List<Dependence> depends;

	private String[] license;
	private boolean loadUnlicensed;

	private String homePage;
	private String description;
	private String classifier;

	private String configurerClassName;
	private String listenerClassName;
	private String propertiesLocations;
	private String contextLocations;
	private String servletContextLocations;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	public List<Dependence> getDepends() {
		return depends;
	}

	public void setDepends(List<Dependence> depends) {
		this.depends = depends;
	}

	public String[] getLicense() {
		return license;
	}

	public void setLicense(String[] license) {
		this.license = license;
	}

	public boolean getLoadUnlicensed() {
		return loadUnlicensed;
	}

	public void setLoadUnlicensed(boolean loadUnlicensed) {
		this.loadUnlicensed = loadUnlicensed;
	}

	public String getHomePage() {
		return homePage;
	}

	public void setHomePage(String homePage) {
		this.homePage = homePage;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	

	public String getPropertiesLocations() {
		return propertiesLocations;
	}

	public void setPropertiesLocations(String propertiesLocations) {
		this.propertiesLocations = StringUtils.isNotEmpty(propertiesLocations) ? propertiesLocations
				.replaceAll(",", ",\n") : propertiesLocations;
	}

	public String getContextLocations() {
		return contextLocations;
	}

	public void setContextLocations(String contextLocations) {
		this.contextLocations = StringUtils.isNotEmpty(contextLocations) ? contextLocations
				.replaceAll(",", ",\n") : contextLocations;
	}

	public String getServletContextLocations() {
		return servletContextLocations;
	}

	public void setServletContextLocations(String servletContextLocations) {
		this.servletContextLocations = StringUtils.isNotEmpty(servletContextLocations) ? servletContextLocations
				.replaceAll(",", ",\n") : servletContextLocations;
	}

	public String getClassifier() {
		return classifier;
	}

	public void setClassifier(String classifier) {
		this.classifier = classifier;
	}

	public String getConfigurerClassName() {
		return configurerClassName;
	}

	public void setConfigurerClassName(String configurerClassName) {
		this.configurerClassName = configurerClassName;
	}

	public String getListenerClassName() {
		return listenerClassName;
	}

	public void setListenerClassName(String listenerClassName) {
		this.listenerClassName = listenerClassName;
	}

	

}
