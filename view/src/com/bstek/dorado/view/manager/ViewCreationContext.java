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

package com.bstek.dorado.view.manager;

import com.bstek.dorado.data.config.definition.DataCreationContext;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-12-2
 */
public class ViewCreationContext extends DataCreationContext {
	private ViewConfig viewConfig;

	public ViewConfig getViewConfig() {
		return viewConfig;
	}

	public void setViewConfig(ViewConfig viewConfig) {
		this.viewConfig = viewConfig;
	}
}
