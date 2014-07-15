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

import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;

import com.bstek.dorado.annotation.DataProvider;
import com.bstek.dorado.core.pkgs.PackageConfigurer;
import com.bstek.dorado.core.pkgs.PackageInfo;
import com.bstek.dorado.core.pkgs.PackageListener;
import com.bstek.dorado.core.pkgs.PackageManager;

/**
 * Dorado Addon Service
 * 
 * @author Alex Tong (mailto:alex.tong@bstek.com)
 * @since 2012-12-07
 */
public class AddonController {

	@DataProvider
	public Collection<Addon> getAddonList() throws Exception {
		List<Addon> list = new ArrayList<Addon>();
		Iterator<PackageInfo> iterator = PackageManager.getPackageInfoMap()
				.values().iterator();
		Addon addon;
		PackageInfo packageInfo;
		while (iterator.hasNext()) {
			packageInfo = iterator.next();
			addon = new Addon();
			addon.setContextLocations(packageInfo.getContextLocations());
			com.bstek.dorado.core.pkgs.Dependence[] depends = packageInfo
					.getDepends();
			Dependence depend;
			List<Dependence> dependList = new ArrayList<Dependence>();
			if (depends != null && depends.length > 0) {
				for (com.bstek.dorado.core.pkgs.Dependence dependence : depends) {
					depend = new Dependence();
					depend.setPackageName(dependence.getPackageName());
					depend.setVersion(dependence.getVersion());
					dependList.add(depend);
				}
			}
			addon.setDepends(dependList);
			addon.setHomePage(packageInfo.getHomePage());
			addon.setLicense(packageInfo.getLicense());
			addon.setLoadUnlicensed(packageInfo.isLoadUnlicensed());
			addon.setDescription(packageInfo.getDescription());
			addon.setName(packageInfo.getName());
			addon.setVersion(packageInfo.getVersion());
			addon.setServletContextLocations(packageInfo
					.getServletContextLocations());
			addon.setPropertiesLocations(packageInfo.getPropertiesLocations());
			addon.setClassifier(packageInfo.getClassifier());
			PackageConfigurer configurer = packageInfo.getConfigurer();
			PackageListener listener = packageInfo.getListener();
			if (configurer != null)
				addon.setConfigurerClassName(configurer.getClass().getName());
			if (listener != null)
				addon.setListenerClassName(listener.getClass().getName());
			list.add(addon);
		}
		return list;
	}
}
