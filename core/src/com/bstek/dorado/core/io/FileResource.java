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
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

import com.bstek.dorado.util.PathUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-5-26
 */
public class FileResource implements Resource {
	private File file;

	public FileResource(File file) {
		this.file = file;
	}

	public String getPath() {
		return file.getAbsolutePath();
	}

	public boolean exists() {
		return file.exists();
	}

	public long getTimestamp() throws IOException {
		return file.lastModified();
	}

	public InputStream getInputStream() throws IOException {
		return new FileInputStream(file);
	}

	public URL getURL() throws IOException {
		return null;
	}

	public File getFile() throws IOException {
		return file;
	}

	public Resource createRelative(String relativePath) throws IOException {
		String path = PathUtils.concatPath(file.getParent(), relativePath);
		File newFile = new File(path);
		return new FileResource(newFile);
	}

	public String getFilename() {
		return file.getName();
	}

	public String getDescription() {
		return getPath();
	}
}
