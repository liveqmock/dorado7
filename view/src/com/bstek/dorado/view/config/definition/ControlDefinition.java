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

package com.bstek.dorado.view.config.definition;

import com.bstek.dorado.config.definition.CreationContext;
import com.bstek.dorado.config.definition.Definition;
import com.bstek.dorado.config.definition.DefinitionUtils;
import com.bstek.dorado.util.CloneUtils;
import com.bstek.dorado.view.registry.ComponentTypeRegisterInfo;
import com.bstek.dorado.view.widget.Control;

/**
 * 控件的配置声明对象。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 28, 2008
 */
public class ControlDefinition extends ComponentDefinition {

	public static class ControlWrapper {
		private Control control;
		private Object layoutConstraint;

		public ControlWrapper(Control control, Object layoutConstraint) {
			this.control = control;
			this.layoutConstraint = layoutConstraint;
		}

		public Control getControl() {
			return control;
		}

		public Object getLayoutConstraint() {
			return layoutConstraint;
		}
	}

	private Object layoutConstraint;

	public ControlDefinition(ComponentTypeRegisterInfo registerInfo) {
		super(registerInfo);
	}

	/**
	 * 返回布局条件的声明。
	 */
	public Object getLayoutConstraint() {
		return layoutConstraint;
	}

	/**
	 * 设置布局条件的声明。
	 */
	public void setLayoutConstraint(Object layoutConstraint) {
		this.layoutConstraint = layoutConstraint;
	}

	/**
	 * @return
	 */
	public Object getFinalLayoutConstraint() {
		Object layoutConstraint = this.layoutConstraint;
		if (layoutConstraint == null && getParents() != null) {
			for (Definition parent : getParents()) {
				if (parent instanceof ControlDefinition) {
					layoutConstraint = ((ControlDefinition) parent)
							.getFinalLayoutConstraint();
					if (layoutConstraint != null)
						break;
				}
			}
		}
		return layoutConstraint;
	}

	@Override
	protected void doInitObject(Object object, CreationInfo creationInfo,
			CreationContext context) throws Exception {
		super.doInitObject(object, creationInfo, context);

		Object layoutConstraintDefinition = getFinalLayoutConstraint();
		Object layoutConstraint = DefinitionUtils.getRealValue(
				layoutConstraintDefinition, context);
		((Control) object).setLayoutConstraint(layoutConstraint);
	}

	@Override
	protected Object clone() throws CloneNotSupportedException {
		ControlDefinition definition = (ControlDefinition) super.clone();
		definition.layoutConstraint = (layoutConstraint != null) ? CloneUtils
				.clone(layoutConstraint) : null;
		return definition;
	}
}
