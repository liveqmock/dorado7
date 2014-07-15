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

package com.bstek.dorado.core.io;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-5-29
 */
public class EmptyResource implements Resource {

	public static final EmptyResource INSTANCE = new EmptyResource();

	private EmptyResource() {
	}

	public String getPath() {
		return null;
	}

	public boolean exists() {
		return false;
	}

	public long getTimestamp() throws IOException {
		return 0;
	}

	public InputStream getInputStream() throws IOException {
		return null;
	}

	public URL getURL() throws IOException {
		return null;
	}

	public File getFile() throws IOException {
		return null;
	}

	public Resource createRelative(String relativePath) throws IOException {
		return null;
	}

	public String getFilename() {
		return null;
	}

	public String getDescription() {
		return null;
	}
}
