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

package com.bstek.dorado.core.io;

import com.bstek.dorado.core.Configure;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-12-7
 */
public class StoreLocationTransformer implements LocationTransformer {

	public String transform(String protocal, String location) {
		return ResourceUtils.concatPath(Configure.getString("core.storeDir"),
				location.substring(protocal.length()));
	}

}
