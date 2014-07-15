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

package com.bstek.dorado.web.resolver;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.core.pkgs.PackageInfo;
import com.bstek.dorado.core.pkgs.PackageManager;
import com.bstek.dorado.util.StringAliasUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-10-17
 */
public class RevisionCacheBusterGenerator implements CacheBusterGenerator {
	private static final String UNKNOWN_VERSION = "<Unknown Version>";
	private static String packageInfoMD5;

	private String getCacheBuster() throws Exception {
		if (packageInfoMD5 == null) {
			StringBuffer stringForMD5 = new StringBuffer();
			for (PackageInfo packageInfo : PackageManager.getPackageInfoMap()
					.values()) {
				String addonVersion = packageInfo.getVersion();
				if (UNKNOWN_VERSION.equals(addonVersion)) {
					addonVersion = String.valueOf(System.currentTimeMillis());
				}
				stringForMD5.append(packageInfo.getName()).append(addonVersion);
			}

			packageInfoMD5 = StringAliasUtils.getMD5(stringForMD5.toString()
					.getBytes());
		}
		return packageInfoMD5;
	}

	public String getCacheBuster(String param) throws Exception {
		return (StringUtils.isEmpty(param)) ? getCacheBuster()
				: (param + getCacheBuster());
	}

}
