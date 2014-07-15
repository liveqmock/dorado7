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

package com.bstek.dorado.util;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

import com.bstek.dorado.core.Configure;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-6-8
 */
public final class DateUtils {
	private static final TimeZone GMT = TimeZone.getTimeZone("GMT");

	private DateUtils() {
	}

	public static TimeZone getGMTTimeZone() {
		return GMT;
	}

	private static TimeZone getDefaultTimeZone() {
		return (Configure.getBoolean("core.useGMTTimeZone")) ? GMT : null;
	}

	public static Date parse(String dateText) throws ParseException {
		SimpleDateFormat sdf = new SimpleDateFormat();
		TimeZone timeZone = getDefaultTimeZone();
		if (timeZone != null) {
			sdf.setTimeZone(timeZone);
		}
		return sdf.parse(dateText);
	}

	public static Date parse(String format, String dateText)
			throws ParseException {
		SimpleDateFormat sdf = new SimpleDateFormat(format);
		TimeZone timeZone = getDefaultTimeZone();
		if (timeZone != null) {
			sdf.setTimeZone(timeZone);
		}
		return sdf.parse(dateText);
	}

	public static String format(Date date) {
		SimpleDateFormat sdf = new SimpleDateFormat();
		TimeZone timeZone = getDefaultTimeZone();
		if (timeZone != null) {
			sdf.setTimeZone(timeZone);
		}
		return sdf.format(date);
	}

	public static String format(String format, Date date) {
		SimpleDateFormat sdf = new SimpleDateFormat(format);
		TimeZone timeZone = getDefaultTimeZone();
		if (timeZone != null) {
			sdf.setTimeZone(timeZone);
		}
		return sdf.format(date);
	}
}
