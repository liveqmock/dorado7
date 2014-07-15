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

package com.bstek.dorado.view.output;

import java.io.IOException;
import java.io.Writer;
import java.util.Collection;
import java.util.Date;

import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.lang.StringEscapeUtils;

import com.bstek.dorado.common.Ignorable;

/**
 * 用于支持客户端输出功能的工具类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Sep 19, 2008
 */
public abstract class OutputUtils {
	/**
	 * 特殊的默认值，用于代表一些常用的属性值。
	 * <ul>
	 * <li>对于java.lang.String类型的属性，"#default"表示null和""。</li>
	 * <li>对于java.lang.Number类型的属性，"#default"表示0。</li>
	 * <li>对于java.lang.Boolean类型的属性，"#default"表示false。</li>
	 * <li>对于java.util.Collection类型的属性，"#default"表示集合的大小为0。</li>
	 * <li>对于其他类型的属性，"#default"表示null。</li>
	 * </ul>
	 */
	public static final String ESCAPE_VALUE = "#default";

	/**
	 * 特殊的用于标识此属性总是应被忽略的属性值。
	 */
	public static final String IGNORE_VALUE = "#ignore";

	/**
	 * 判断一个属性值是否与默认值一致。
	 * 
	 * @param value
	 *            属性值。
	 * @return 是否一致。
	 */
	public static boolean isEscapeValue(Object value) {
		return isEscapeValue(value, ESCAPE_VALUE);
	}

	/**
	 * 判断一个属性值是否与默认值一致。
	 * 
	 * @param value
	 *            属性值。
	 * @param escapeValue
	 *            默认值。
	 * @return 是否一致。
	 */
	public static boolean isEscapeValue(Object value, Object escapeValue) {
		if (value != escapeValue) {
			if (ESCAPE_VALUE.equals(escapeValue)) {
				return (value == null
						|| (value instanceof String && value.equals(""))
						|| (value instanceof Number && ((Number) value)
								.doubleValue() == 0)
						|| (value instanceof Boolean && !((Boolean) value)
								.booleanValue())
						|| (value instanceof Collection<?> && ((Collection<?>) value)
								.isEmpty()) || (value instanceof Ignorable && ((Ignorable) value)
						.isIgnored()));
			} else if (IGNORE_VALUE.equals(escapeValue)) {
				return true;
			}
			return String.valueOf(value).equals(String.valueOf(escapeValue));
		}
		return true;
	}

	/**
	 * 输出HTML中JavaScript标记的开始部分。
	 * 
	 * @throws IOException
	 */
	public static void outputScriptBeginTag(Writer writer) throws IOException {
		writer.write("<script language=\"javascript\" type=\"text/javascript\">\n");
	}

	/**
	 * 输出HTML中JavaScript标记的结束部分。
	 * 
	 * @throws IOException
	 */
	public static void outputScriptEndTag(Writer writer) throws IOException {
		writer.write("</script>\n");
	}

	/**
	 * 以安全的方式向HTML中输出一个段文本。
	 * 
	 * @throws IOException
	 */
	public static void outputString(Writer writer, String s) throws IOException {
		writer.write(StringEscapeUtils.escapeHtml(s));
	}

	/**
	 * 将Java对象的某属性输出为JavaScript属性。
	 * 
	 * @param writer
	 *            Writer
	 * @param owner
	 *            该属性在JavaScript种的宿主。
	 * @param object
	 *            Java对象。
	 * @param property
	 *            要输出的属性名。
	 * @param escapeValue
	 *            默认值。如果Java对象的实际属性值与默认值一致则忽略此次输出操作。
	 * @throws Exception
	 * @see #DEFAULT_VALUE
	 */
	public static void outputProperty(Writer writer, String owner,
			Object object, String property, Object escapeValue)
			throws Exception {
		Object value = PropertyUtils.getProperty(object, property);
		if (value == escapeValue
				|| (escapeValue != null && escapeValue.equals(value))) {
			return;
		}

		writer.write(owner);
		writer.write('.');
		writer.write(property);
		writer.write('=');

		if (value == null) {
			writer.write("null");
		} else if (value instanceof String) {
			writer.write("\"");
			writer.write((String) value);
			writer.write("\"");
		} else if (value instanceof Number || value instanceof Boolean) {
			writer.write(value.toString());
		} else if (value instanceof Date) {
			writer.write("new Date(");
			writer.write(String.valueOf(((Date) value).getTime()));
			writer.write(")");
		} else {
			writer.write("\"");
			writer.write(value.toString());
			writer.write("\"");
		}
		writer.write(";\n");
	}

	/**
	 * 将Java对象的某属性输出为JavaScript属性。
	 * 
	 * @param writer
	 *            Writer
	 * @param owner
	 *            该属性在JavaScript种的宿主。
	 * @param object
	 *            Java对象。
	 * @param property
	 *            要输出的属性名。
	 */
	public static void outputProperty(Writer writer, String owner,
			Object object, String property) throws Exception {
		outputProperty(writer, owner, object, property, null);
	}
}
