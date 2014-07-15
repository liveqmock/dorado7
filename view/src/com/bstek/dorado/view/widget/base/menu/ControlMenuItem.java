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

package com.bstek.dorado.view.widget.base.menu;

import java.util.Collection;
import java.util.HashSet;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.annotation.XmlSubNode;
import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.view.ViewElement;
import com.bstek.dorado.view.widget.Control;
import com.bstek.dorado.view.widget.FloatControl;
import com.bstek.dorado.view.widget.InnerElementReference;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-8-6
 */
@ClientObject(prototype = "dorado.widget.menu.ControlMenuItem",
		shortTypeName = "Control")
@XmlNode(clientTypes = ClientType.DESKTOP)
public class ControlMenuItem extends TextMenuItem implements ViewElement {
	private InnerElementReference<Control> controlRef = new InnerElementReference<Control>(
			this);
	private Collection<ViewElement> innerElements = new HashSet<ViewElement>();

	@XmlSubNode
	@ClientProperty
	public FloatControl getControl() {
		return (FloatControl) controlRef.get();
	}

	public void setControl(FloatControl control) {
		controlRef.set((Control) control);
	}

	@Override
	public void registerInnerElement(ViewElement element) {
		innerElements.add(element);
	}

	@Override
	public void unregisterInnerElement(ViewElement element) {
		innerElements.remove(element);
	}

	@Override
	public Collection<ViewElement> getInnerElements() {
		return innerElements;
	}
}
