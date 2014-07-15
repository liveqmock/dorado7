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

package com.bstek.dorado.data.config.definition;

import java.util.Map;

import com.bstek.dorado.config.ExpressionMethodInterceptor;
import com.bstek.dorado.config.definition.CreationContext;
import com.bstek.dorado.config.definition.Definition;
import com.bstek.dorado.config.definition.DefinitionReference;
import com.bstek.dorado.config.definition.ObjectDefinition;
import com.bstek.dorado.core.el.EvaluateMode;
import com.bstek.dorado.core.el.Expression;
import com.bstek.dorado.data.config.EntityExpressionMethodInterceptor;

/**
 * 通用的对象配置声明对象。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 12, 2008
 */
public class GenericObjectDefinition extends ObjectDefinition {

	/**
	 * 根据EL表达式的集合创建一个动态表达式拦截器。<br>
	 * 其中expressionProperties参数的键值为相应的对象属性名，值为EL表达式。
	 * 
	 * @return 新创建的方法拦截器。
	 */
	@Override
	protected ExpressionMethodInterceptor createExpressionMethodInterceptor(
			Map<String, Expression> expressionProperties) {
		return new EntityExpressionMethodInterceptor(expressionProperties);
	}

	@Override
	protected Object getFinalValueOrExpression(Object valueDefinition,
			CreationContext creationContext) throws Exception {
		if (valueDefinition != null) {
			Definition definition = null;
			if (valueDefinition instanceof DefinitionReference<?>) {
				definition = ((DefinitionReference<?>) valueDefinition)
						.getDefinition();
			} else if (valueDefinition instanceof Definition) {
				definition = (Definition) valueDefinition;
			}

			Object value;
			if (definition != null) {
				// TODO: 此判断的作用何在须检查
				if (definition instanceof DataTypeDefinition) {
					value = definition;
				} else {
					value = definition.create(creationContext);
				}
			} else {
				value = valueDefinition;
			}

			if (value instanceof Expression
					&& ((Expression) value).getEvaluateMode() == EvaluateMode.onInstantiate) {
				value = ((Expression) value).evaluate();
			}
			return value;
		} else {
			return null;
		}
	}

}
