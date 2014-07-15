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

package com.bstek.dorado.core;

import com.bstek.dorado.core.io.ResourceLoader;
import com.bstek.dorado.core.pkgs.AbstractPackageConfigurer;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2013-6-9
 */
public class CorePackageConfigurer extends AbstractPackageConfigurer {

	public String[] getPropertiesConfigLocations(ResourceLoader resourceLoader)
			throws Exception {
		return null;
	}

	public String[] getContextConfigLocations(ResourceLoader resourceLoader)
			throws Exception {
		if (Configure.getBoolean("console.enabled", false)) {
			return new String[] { "classpath:com/bstek/dorado/console/context.xml" };
		}
		return null;
	}

	public String[] getComponentConfigLocations(ResourceLoader resourceLoader)
			throws Exception {
		return null;
	}

	public String[] getServletContextConfigLocations(
			ResourceLoader resourceLoader) throws Exception {
		if (Configure.getBoolean("console.enabled", false)) {
			return new String[] { "classpath:com/bstek/dorado/console/servlet-context.xml" };
		}
		return null;
	}

}
