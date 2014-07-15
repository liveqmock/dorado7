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

import com.bstek.dorado.util.proxy.ChildrenListSupport;
import com.bstek.dorado.view.ViewElement;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-2-27
 */
public class InnerElementList<E> extends ChildrenListSupport<E> {
	private ViewElement parent;

	public InnerElementList(ViewElement parent) {
		this.parent = parent;
	}

	@Override
	protected void childAdded(E child) {
		if (child != null && child instanceof ViewElement) {
			ViewElement element = (ViewElement) child;
			parent.registerInnerElement(element);
			element.setParent(parent);
		}
	}

	@Override
	protected void childRemoved(E child) {
		if (child != null && child instanceof ViewElement) {
			ViewElement element = (ViewElement) child;
			element.setParent(null);
			parent.unregisterInnerElement(element);
		}
	}
}
