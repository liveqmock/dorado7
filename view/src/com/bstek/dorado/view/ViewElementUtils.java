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

package com.bstek.dorado.view;

import java.util.Collection;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-4-25
 */
public abstract class ViewElementUtils {
	private ViewElementUtils() {
	}

	public static View getParentView(ViewElement parent) {
		if (parent instanceof View) {
			return (View) parent;
		} else {
			return parent.getView();
		}
	}

	private static void unregisterFromView(ViewElement element, View view) {
		Collection<ViewElement> innerElements = element.getInnerElements();
		if (innerElements != null) {
			for (ViewElement innerElement : innerElements) {
				unregisterFromView(innerElement, view);
			}
		}

		view.unregisterViewElement(element);
	}

	public static void clearParentViewElement(ViewElement element,
			ViewElement oldParent) {
		if (oldParent == null) {
			return;
		}
		View view = getParentView(oldParent);
		if (view != null) {
			unregisterFromView(element, view);
		}
	}

	private static void registerToView(ViewElement element, View view) {
		view.registerViewElement(element);

		Collection<ViewElement> innerElements = element.getInnerElements();
		if (innerElements != null) {
			for (ViewElement innerElement : innerElements) {
				registerToView(innerElement, view);
			}
		}
	}

	public static void setParentViewElement(ViewElement element,
			ViewElement parent) {
		if (parent != null) {
			View view = getParentView(parent);
			if (view != null) {
				registerToView(element, view);
			}
		}
	}
}
