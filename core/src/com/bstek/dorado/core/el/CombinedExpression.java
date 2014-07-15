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

package com.bstek.dorado.core.el;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.jexl2.Expression;
import org.apache.commons.jexl2.JexlContext;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * 组合的EL表达式描述对象。
 * <p>
 * 组合的EL表达式一般源自配置文件中的文本与EL表达式组合的配置方式，如:
 *
 * <pre>
 * &lt;value&gt;当前日期：${Util.currentDate}&lt;/value&gt;
 * </pre>
 *
 * </p>
 * <p>
 * 组合的EL表达式一般由1~n段文本和1~n个表达式构成，整个表达式最终的返回结果一定是一个字符串。
 * </p>
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 4, 2007
 */
public class CombinedExpression extends AbstractExpression {
	private static final Log logger = LogFactory
			.getLog(CombinedExpression.class);

	private List<Object> sections;

	public CombinedExpression() {
		sections = new ArrayList<Object>();
	}

	/**
	 * @param sections 段落的集合。其中应包含1~n段文本和1~n个表达式。
	 */
	public CombinedExpression(List<Object> sections) {
		this.sections = sections;
	}

	/**
	 * @param sections
	 * @param evaluateMode
	 */
	public CombinedExpression(List<Object> sections, EvaluateMode evaluateMode) {
		this(sections);
		setEvaluateMode(evaluateMode);
	}

	/**
	 * 向组合中追加一段文本。
	 */
	public void addSection(String s) {
		sections.add(s);
	}

	/**
	 * 向组合中追加一个表达式。
	 * @param expr Jexl中的表达式对象。
	 */
	public void addSection(Expression expr) {
		sections.add(expr);
	}

	/**
	 * 返回段落的集合。
	 */
	public List<?> getSections() {
		return sections;
	}

	@Override
	protected Object internalEvaluate() {
		JexlContext context = getJexlContext();

		StringBuffer sb = new StringBuffer();
		for (Object section : sections) {
			if (section == null) continue;
			if (section instanceof Expression) {
				Expression expression = (Expression) section;
				try {
					Object value = internalEvaluateExpression(expression,
							context);
					if (value != null) {
						sb.append(value);
					}
				}
				catch (Exception e) {
					logger.warn(e, e);
				}
			}
			else {
				sb.append(section);
			}
		}
		return sb.toString();
	}

	@Override
	public int hashCode() {
		return sections.hashCode();
	}

	@Override
	public boolean equals(Object obj) {
		if (obj instanceof CombinedExpression) {
			return ((CombinedExpression) obj).sections.equals(sections);
		}
		else {
			return false;
		}
	}

	@Override
	public String toString() {
		StringBuffer sb = new StringBuffer();
		for (Object section : sections) {
			if (section instanceof Expression) {
				if (getEvaluateMode() == EvaluateMode.onRead) {
					sb.append('$');
				}
				sb.append("${").append(((Expression) section).getExpression())
						.append('}');
			}
			else {
				sb.append(section);
			}
		}
		return sb.toString();
	}

}
