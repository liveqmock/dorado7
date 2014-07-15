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

package com.bstek.dorado.console.web;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.bstek.dorado.annotation.DataProvider;
import com.bstek.dorado.view.loader.Package;
import com.bstek.dorado.view.loader.PackagesConfig;
import com.bstek.dorado.view.loader.PackagesConfigManager;
import com.bstek.dorado.web.DoradoContext;

/**
 * Packages Config Service
 * 
 * @author Alex Tong (mailto:alex.tong@bstek.com)
 * @since 2012-12-27
 */

public class PackageController {
	@DataProvider
	public Collection<PackageVO> getPackageList() throws Exception {
		PackagesConfigManager manager = (PackagesConfigManager) DoradoContext
				.getAttachedWebApplicationContext().getBean(
						"dorado.packagesConfigManager");
		PackagesConfig config = manager.getPackagesConfig();
		Map<String, Package> map = config.getPackages();
		List<PackageVO> list = new ArrayList<PackageVO>();
		PackageVO doradoPackage;
		Iterator<String> iterator = map.keySet().iterator();
		while (iterator.hasNext()) {
			String name = (String) iterator.next();
			doradoPackage = new PackageVO(map.get(name));
			list.add(doradoPackage);
		}

		return list;

	}
}
