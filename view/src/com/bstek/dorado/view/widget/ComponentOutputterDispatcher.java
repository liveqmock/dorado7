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

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.output.ObjectOutputterDispatcher;
import com.bstek.dorado.view.output.OutputContext;
import com.bstek.dorado.view.registry.ComponentTypeRegisterInfo;
import com.bstek.dorado.view.registry.ComponentTypeRegistry;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-12-10
 */
public class ComponentOutputterDispatcher extends ObjectOutputterDispatcher {
	private ComponentTypeRegistry componentTypeRegistry;

	public void setComponentTypeRegistry(
			ComponentTypeRegistry componentTypeRegistry) {
		this.componentTypeRegistry = componentTypeRegistry;
	}

	@Override
	protected void outputObject(Object object, OutputContext context)
			throws Exception {
		super.outputObject(object, context);

		if (object instanceof Component) {
			String dependsPackage = null;
			ComponentTypeRegisterInfo registerInfo = componentTypeRegistry
					.getRegisterInfo(object.getClass());
			if (registerInfo != null) {
				dependsPackage = registerInfo.getDependsPackage();
			} else {
				Widget widget = object.getClass().getAnnotation(Widget.class);
				if (widget != null) {
					dependsPackage = widget.dependsPackage();
				}
			}

			if (dependsPackage != null
					&& StringUtils.isNotEmpty(dependsPackage)) {
				context.addDependsPackage(dependsPackage);
			}
		}
	}
}
