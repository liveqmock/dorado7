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

import java.text.DecimalFormat;
import java.util.Calendar;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.core.Constants;
import com.bstek.dorado.util.DateUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-12-24
 */
public class ExpressionUtilsObject {

	public java.util.Date getDate() {
		return new Date();
	}

	public String getDate(String format) {
		return formatDate(new Date(), format);
	}

	public String formatDate(java.util.Date date, String format) {
		return DateUtils.format(format, date);
	}

	public java.util.Date getToday() {
		Calendar calendar = Calendar.getInstance();
		calendar.set(Calendar.HOUR_OF_DAY, 0);
		calendar.set(Calendar.MINUTE, 0);
		calendar.set(Calendar.SECOND, 0);
		calendar.set(Calendar.MILLISECOND, 0);
		return calendar.getTime();
	}

	public java.util.Date calculateDate(String expression) {
		return calculateDate(new java.util.Date(), expression);
	}

	public java.util.Date calculateDate(java.util.Date date, String expression) {
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(date);

		if (StringUtils.isNotBlank(expression)) {
			char fieldChar = 0;
			int field = 0, offset = 0;
			boolean offsetFound = false;
			StringBuffer numText = new StringBuffer();
			for (int i = 0, len = expression.length(); i < len; i++) {
				char c = expression.charAt(i);
				if (c == ' ' || c == ',' || c == ';') {
					if (field != 0) {
						if (numText.length() == 0) {
							throw new IllegalArgumentException(
									"Argument missed for Date field \""
											+ fieldChar + "\".");
						}

						int num = Integer.parseInt(numText.toString());
						if (offset == 0) {
							calendar.set(field, num);
						} else {
							calendar.add(field, num * offset);
						}
					}

					fieldChar = 0;
					field = 0;
					offset = 0;
					offsetFound = false;
					numText.setLength(0);
				} else if (field == 0) {
					switch (c) {
					case 'y':
					case 'Y':
						field = Calendar.YEAR;
						break;
					case 'M':
						field = Calendar.MONTH;
						break;
					case 'd':
						field = Calendar.DAY_OF_MONTH;
						break;
					case 'h':
					case 'H':
						field = Calendar.HOUR_OF_DAY;
						break;
					case 'm':
						field = Calendar.MINUTE;
						break;
					case 's':
						field = Calendar.SECOND;
						break;
					case 'z':
					case 'Z':
						field = Calendar.MILLISECOND;
						break;
					default:
						throw new IllegalArgumentException(
								"Unknown Date field \"" + c + "\".");
					}
					fieldChar = c;
				} else if (!offsetFound && numText.length() == 0) {
					if (c == '+') {
						offset = 1;
						offsetFound = true;
					} else if (c == '-') {
						offset = -1;
						offsetFound = true;
					}
				} else if (c >= '0' && c <= '9') {
					numText.append(c);
				}
			}

			if (field != 0) {
				if (numText.length() == 0) {
					throw new IllegalArgumentException(
							"Argument missed for Date field \"" + fieldChar
									+ "\".");
				}

				int num = Integer.parseInt(numText.toString());
				if (offset == 0) {
					calendar.set(field, num);
				} else {
					calendar.add(field, num * offset);
				}
			}
		}

		return calendar.getTime();
	}

	public String formatNumber(Number d, String format) {
		return new DecimalFormat(format).format(d);
	}

	public String trim(String s) {
		return StringUtils.trim(s);
	}

	public Object defaultValue(Object value, Object defaultValue) {
		if (value == null
				|| (value instanceof String && value.equals(""))
				|| (value instanceof Number && ((Number) value).doubleValue() == 0)
				|| (value instanceof Boolean && !((Boolean) value)
						.booleanValue())) {
			return defaultValue;
		}
		return value;
	}

}

class Date extends java.util.Date {
	private static final long serialVersionUID = 4952841582905835573L;

	public Date() {
		super();
	}

	public Date(long l) {
		super(l);
	}

	@Override
	public String toString() {
		return DateUtils.format(Constants.ISO_DATETIME_FORMAT1, this);
	}

}
