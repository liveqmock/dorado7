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

import org.apache.commons.lang.math.NumberUtils;

import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.web.DoradoContext;
import com.bstek.dorado.web.resolver.ResourceFileResolver;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2014-2-21
 */
@Deprecated
public class IE6PngFileResolver extends ResourceFileResolver {
	private static final String MSIE = "MSIE";
	private final static String CHROME_FRAME = "chromeframe";
	private final static Pattern MSIE_VERSION_PATTERN = Pattern
			.compile("^.*?MSIE\\s+(\\d+).*$");
	private final static String PNG24_DIR = "/silk/";
	private final static String PNG8_DIR = "/silk.deprecated/";

	protected Resource[] getResourcesByFileName(DoradoContext context,
			String resourcePrefix, String fileName, String resourceSuffix)
			throws Exception {
		String ua = context.getRequest().getHeader("User-Agent");
		if (ua.indexOf(CHROME_FRAME) < 0) {
			boolean isMSIE = (ua != null && ua.indexOf(MSIE) != -1);
			if (isMSIE) {
				float version = NumberUtils.toFloat(MSIE_VERSION_PATTERN
						.matcher(ua).replaceAll("$1"), Float.MAX_VALUE);
				if (version < 7) {
					fileName = fileName.replace(PNG24_DIR, PNG8_DIR);
				}
			}
		}
		return super.getResourcesByFileName(context, resourcePrefix, fileName,
				resourceSuffix);
	}
}
