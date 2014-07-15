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

import com.bstek.dorado.config.definition.DefinitionReference;

/**
 * 指向组件的配置声明对象的引用。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apr 1, 2008
 */
public class ComponentDefinitionReference implements
		DefinitionReference<ComponentDefinition> {
	private ViewDefinition viewDefinition;
	private String componentId;

	/**
	 * @param viewDefinition 视图的配置声明对象。
	 * @param componentId 要指向的组件的id。
	 */
	public ComponentDefinitionReference(ViewDefinition viewDefinition,
			String componentId) {
		this.viewDefinition = viewDefinition;
		this.componentId = componentId;
	}

	public ComponentDefinition getDefinition() {
		return viewDefinition.getComponent(componentId);
	}
}
