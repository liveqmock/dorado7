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

package com.bstek.dorado.config.definition;

/**
 * 通过直接关联指向某配置声明对象的引用。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 21, 2008
 */
public class DirectDefinitionReference<T extends Definition> implements
		DefinitionReference<T> {
	private T definition;

	/**
	 * @param definition 被引用的配置声明对象
	 */
	public DirectDefinitionReference(T definition) {
		this.definition = definition;
	}

	public T getDefinition() {
		return definition;
	}

}
