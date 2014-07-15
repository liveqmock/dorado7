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
 * 配置声明对象相关的工具类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 8, 2008
 */
public abstract class DefinitionUtils {

	private DefinitionUtils() {
	}

	/**
	 * 根据传入的对象返回配置声明对象。<br>
	 * 如果传入的对象本身就是配置声明对象将直接返回;如果传入的对象是指向配置声明对象的引用,则返回其指向的目标对象; 如果不是前两种情况则将抛错。
	 * 
	 * @param defOrRef
	 *            传入的对象
	 * @return 配置声明对象
	 */
	public static Definition getDefinition(Object defOrRef) {
		if (defOrRef == null) {
			return null;
		} else if (defOrRef instanceof Definition) {
			return (Definition) defOrRef;
		} else if (defOrRef instanceof DefinitionReference<?>) {
			return ((DefinitionReference<?>) defOrRef).getDefinition();
		} else {
			throw new IllegalArgumentException(
					"Unrecognised Definition or DefinitionReference instance ["
							+ defOrRef + "].");
		}
	}

	/**
	 * 根据值的声明返回真正的数值。<br>
	 * 此处传入的valueDefinition参数有可能是以下四种情况之一:
	 * <ul>
	 * <li>具体的数值，直接返回。</li>
	 * <li>EL表达式{@link com.bstek.dorado.core.el.Expression}，将被执行并得到具体的数据或对象。</li>
	 * <li>配置声明对象{@link com.bstek.dorado.config.definition.Definition}
	 * ，将被转换成具体的数据或对象。</li>
	 * <li>配置声明对象的引用
	 * {@link com.bstek.dorado.config.definition.DefinitionReference}
	 * ，将被转换成具体的数据或对象。</li>
	 * </ul>
	 * 
	 * @param valueDefinition
	 *            值的声明
	 * @param context
	 *            创建最终对象的上下文
	 * @return 真正的数值
	 * @throws Exception
	 */
	public static Object getRealValue(Object valueDefinition,
			CreationContext context) throws Exception {
		if (valueDefinition != null) {
			Object value;
			if (valueDefinition instanceof DefinitionReference<?>) {
				Definition definition = ((DefinitionReference<?>) valueDefinition)
						.getDefinition();
				value = definition.create(context);
			} else if (valueDefinition instanceof Definition) {
				value = ((Definition) valueDefinition).create(context);
			} else {
				value = valueDefinition;
			}
			return value;
		} else {
			return null;
		}
	}
}
