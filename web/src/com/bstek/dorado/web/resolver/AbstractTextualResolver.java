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

import java.io.BufferedOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.util.zip.GZIPOutputStream;
import java.util.zip.ZipOutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;

import com.bstek.dorado.core.Constants;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-1-31
 */
public abstract class AbstractTextualResolver extends AbstractResolver {
	private String contentType = HttpConstants.CONTENT_TYPE_TEXT;
	private String cacheControl;
	private String characterEncoding = Constants.DEFAULT_CHARSET;
	private boolean shouldCompress = true;

	public String getContentType() {
		return contentType;
	}

	public void setContentType(String contentType) {
		this.contentType = contentType;
	}

	public String getCacheControl() {
		return cacheControl;
	}

	public void setCacheControl(String cacheControl) {
		this.cacheControl = cacheControl;
	}

	public String getCharacterEncoding() {
		return characterEncoding;
	}

	public void setCharacterEncoding(String characterEncoding) {
		this.characterEncoding = characterEncoding;
	}

	public boolean isShouldCompress() {
		return shouldCompress;
	}

	public void setShouldCompress(boolean shouldCompress) {
		this.shouldCompress = shouldCompress;
	}

	protected PrintWriter getWriter(HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		OutputStream out = getOutputStream(request, response);
		return new PrintWriter(new OutputStreamWriter(out, characterEncoding));
	}

	/**
	 * 返回Response的输出流。
	 * 
	 * @throws IOException
	 */
	protected OutputStream getOutputStream(HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		int encodingType = 0;
		String encoding = request.getHeader(HttpConstants.ACCEPT_ENCODING);
		if (encoding != null) {
			encodingType = (encoding.indexOf(HttpConstants.GZIP) >= 0) ? 1
					: (encoding.indexOf(HttpConstants.COMPRESS) >= 0 ? 2 : 0);
		}

		OutputStream out = response.getOutputStream();
		if (encodingType > 0 && isShouldCompress()) {
			try {
				if (encodingType == 1) {
					response.setHeader(HttpConstants.CONTENT_ENCODING,
							HttpConstants.GZIP);
					out = new GZIPOutputStream(out);
				} else if (encodingType == 2) {
					response.setHeader(HttpConstants.CONTENT_ENCODING,
							HttpConstants.COMPRESS);
					out = new ZipOutputStream(out);
				}
			} catch (IOException e) {
				// do nothing
			}
		}
		return new BufferedOutputStream(out);
	}

	@Override
	protected final ModelAndView doHandleRequest(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		if (contentType != null) {
			response.setContentType(contentType);
		}
		if (characterEncoding != null) {
			response.setCharacterEncoding(characterEncoding);
		}
		if (cacheControl != null) {
			response.addHeader(HttpConstants.CACHE_CONTROL, cacheControl);
			if (HttpConstants.NO_CACHE.equals(cacheControl)) {
				response.addHeader("Pragma", "no-cache");
				response.addHeader("Expires", "0");
			}
		}

		execute(request, response);
		return null;
	}

	public abstract void execute(HttpServletRequest request,
			HttpServletResponse response) throws Exception;

}
