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

package com.bstek.dorado.view.widget;

import java.util.Map;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-8-7
 */
public interface RenderableElement extends HtmlElement {
	String getClassName();

	void setClassName(String className);

	@Deprecated
	String getExClassName();

	@Deprecated
	void setExClassName(String exClassName);

	String getWidth();

	void setWidth(String width);

	String getHeight();

	void setHeight(String height);

	Map<String, Object> getStyle();

	void setStyle(Map<String, Object> style);
}
