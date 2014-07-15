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

package com.bstek.dorado.data.type;

/**
 * 用于描述java.lang.Boolean的数据类型。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 13, 2007
 */
public class BooleanDataType extends SimpleDataType {

	public static final String VALUE_TRUE = "true";
	public static final String VALUE_FALSE = "false";

	public static final String VALUE_ON = "on";
	public static final String VALUE_OFF = "off";

	public static final String VALUE_YES = "yes";
	public static final String VALUE_NO = "no";

	public static final String VALUE_1 = "1";
	public static final String VALUE_0 = "0";

	public Object fromText(String text) {
		if (text == null) {
			return null;
		} else if (text.equalsIgnoreCase(VALUE_TRUE)
				|| text.equalsIgnoreCase(VALUE_ON)
				|| text.equalsIgnoreCase(VALUE_YES)
				|| text.equalsIgnoreCase(VALUE_1)) {
			return Boolean.TRUE;
		}
		return Boolean.FALSE;
	}

	@Override
	public Object fromObject(Object value) {
		if (value == null) {
			return null;
		} else if (value instanceof Boolean) {
			return value;
		} else if (value instanceof String) {
			return fromText((String) value);
		}
		return Boolean.FALSE;

	}

}
