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

package com.bstek.dorado.core.pkgs;

import javax.servlet.ServletContextListener;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-7-22
 */
public class PackageInfo {
	private String name;
	private String addonVersion;
	private String version;
	private Dependence[] depends;
	private boolean enabled = true;

	/*
	 * Inherited, AGPL, BSDN-Member, BSDN-Commercial
	 */
	private String[] license;
	private boolean loadUnlicensed;

	/*
	 * component,enhancement,skin,resource,app
	 */
	private String classifier;
	private String homePage;
	private String description;

	private PackageConfigurer configurer;
	private PackageListener listener;
	private ServletContextListener servletContextListener;
	private String propertiesLocations;
	private String contextLocations;
	private String componentLocations;

	private String servletContextLocations;

	private boolean loaded;

	public PackageInfo(String name) {
		this.name = name;
	}

	public String getName() {
		return name;
	}

	public String getAddonVersion() {
		return addonVersion;
	}

	public void setAddonVersion(String addonVersion) {
		this.addonVersion = addonVersion;
	}

	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	public Dependence[] getDepends() {
		return depends;
	}

	public void setDepends(Dependence[] depends) {
		this.depends = depends;
	}

	public boolean isEnabled() {
		return enabled;
	}

	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}

	public String[] getLicense() {
		return license;
	}

	public void setLicense(String[] license) {
		this.license = license;
	}

	public boolean isLoadUnlicensed() {
		return loadUnlicensed;
	}

	public void setLoadUnlicensed(boolean loadUnlicensed) {
		this.loadUnlicensed = loadUnlicensed;
	}

	public String getClassifier() {
		return classifier;
	}

	public void setClassifier(String classifier) {
		this.classifier = classifier;
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

	public PackageConfigurer getConfigurer() {
		return configurer;
	}

	public void setConfigurer(PackageConfigurer configurer) {
		this.configurer = configurer;
	}

	public PackageListener getListener() {
		return listener;
	}

	public void setListener(PackageListener listener) {
		this.listener = listener;
	}

	public ServletContextListener getServletContextListener() {
		return servletContextListener;
	}

	public void setServletContextListener(
			ServletContextListener servletContextListener) {
		this.servletContextListener = servletContextListener;
	}

	public String getPropertiesLocations() {
		return propertiesLocations;
	}

	public void setPropertiesLocations(String propertiesLocations) {
		this.propertiesLocations = propertiesLocations;
	}

	public String getContextLocations() {
		return contextLocations;
	}

	public void setContextLocations(String contextLocations) {
		this.contextLocations = contextLocations;
	}

	public String getComponentLocations() {
		return componentLocations;
	}

	public void setComponentLocations(String componentLocations) {
		this.componentLocations = componentLocations;
	}

	public String getServletContextLocations() {
		return servletContextLocations;
	}

	public void setServletContextLocations(String servletContextLocations) {
		this.servletContextLocations = servletContextLocations;
	}

	public boolean isLoaded() {
		return loaded;
	}

	public void setLoaded(boolean loaded) {
		this.loaded = loaded;
	}
}
