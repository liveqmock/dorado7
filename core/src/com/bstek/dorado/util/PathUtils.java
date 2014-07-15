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

import org.apache.commons.lang.StringUtils;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.PathMatcher;

/**
 * 用于辅助路径计算及通配等功能的工具类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jan 18, 2008
 */
public abstract class PathUtils {
	public static final char PATH_DELIM = '/';

	private static PathMatcher matcher = new AntPathMatcher();

	/**
	 * 判断给定的字符串是否匹配通配表达式。
	 * 
	 * @param pattern
	 *            通配表达式
	 * @param text
	 *            要判断的字符串
	 * @return 是否匹配
	 */
	public static boolean match(String pattern, String text) {
		return (StringUtils.isNotEmpty(text)) ? matcher.match(pattern, text)
				: false;
	}
	
	public static String concatPath(String... paths) {
		StringBuffer result = new StringBuffer();
		for (String path : paths) {
			if (StringUtils.isEmpty(path)) {
				continue;
			}
			if (result.length() > 0) {
				boolean endsWithDelim = (result.charAt(result.length() - 1) == PATH_DELIM);
				boolean startsWithDelim = (path.charAt(0) == PATH_DELIM);
				if (endsWithDelim) {
					if (startsWithDelim) {
						result.setLength(result.length() - 1);
					}
				} else if (!startsWithDelim)
					result.append(PATH_DELIM);
			}
			result.append(path);
		}
		return result.toString();
	}

	public static boolean isSafePath(String path) {
		boolean dangerous = (path.contains("..") || StringUtils.containsAny(
				path, ",: \n\r"));
		return !dangerous;
	}
}
