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

package com.bstek.dorado.view.resolver;

import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.core.io.LocationTransformer;
import com.bstek.dorado.util.PathUtils;
import com.bstek.dorado.web.DoradoContext;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2014-2-21
 */
@Deprecated
public class FontAwesomeLocationTransformer implements LocationTransformer {
	private static final String MSIE = "MSIE";
	private final static String CHROME_FRAME = "chromeframe";
	private final static Pattern MSIE_VERSION_PATTERN = Pattern
			.compile("^.*?MSIE\\s+(\\d+).*$");
	private final static String NORMAL_DIR = "classpath:dorado/resources/icons/font-awesome";
	private final static String FAILSAFE_DIR = "classpath:dorado/resources/icons/font-awesome.deprecated";

	public String transform(String protocal, String location) {
		HttpServletRequest request = DoradoContext.getAttachedRequest();
		if (request != null) {
			String ua = request.getHeader("User-Agent");
			if (ua.indexOf(CHROME_FRAME) < 0) {
				boolean isMSIE = (ua != null && ua.indexOf(MSIE) != -1);
				if (isMSIE) {
					String version = MSIE_VERSION_PATTERN.matcher(ua)
							.replaceAll("$1");
					if (StringUtils.isNotEmpty(version)
							&& "8".compareTo(version) > 0) {
						return PathUtils.concatPath(FAILSAFE_DIR,
								location.substring(protocal.length()));
					}
				}
			}
		}
		return PathUtils.concatPath(NORMAL_DIR,
				location.substring(protocal.length()));
	}
}
