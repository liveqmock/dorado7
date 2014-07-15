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

package com.bstek.dorado.data;

import java.util.Collection;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-10-22
 */
public interface JsonConvertContext {
	/**
	 * @return
	 */
	public Collection<Object> getEntityCollection();

	/**
	 * @return
	 */
	public Collection<Collection<?>> getEntityListCollection();

	/**
	 * @return
	 */
	public DataTypeResolver getDataTypeResolver();
}
