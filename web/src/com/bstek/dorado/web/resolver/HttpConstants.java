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

package com.bstek.dorado.web.resolver;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-11-23
 */
public abstract class HttpConstants {
	public static final String CONTENT_TYPE_HTML = "text/html";
	public static final String CONTENT_TYPE_XML = "text/xml";
	public static final String CONTENT_TYPE_OCTET_STREAM = "application/octet-stream";
	public static final String CONTENT_TYPE_JAVASCRIPT = "text/javascript";
	public static final String CONTENT_TYPE_CSS = "text/css";
	public static final String CONTENT_TYPE_TEXT = "application/text";

	public static final String IF_MODIFIED_SINCE = "If-Modified-Since";
	public static final String LAST_MODIFIED = "Last-Modified";

	public static final String ACCEPT_ENCODING = "Accept-Encoding";
	public static final String CONTENT_ENCODING = "Content-Encoding";
	public static final String GZIP = "gzip";
	public static final String COMPRESS = "compress";

	public static final String CACHE_CONTROL = "Cache-Control";
	public static final String NO_CACHE = "no-cache, no-store";
	public static final String MAX_AGE = "max-age=";
}
